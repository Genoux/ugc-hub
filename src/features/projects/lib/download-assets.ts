import JSZip from "jszip";

function safeZipName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, "_").trim() || "download";
}

async function fetchBlobFromDownloadRoute(assetId: string): Promise<Blob> {
  const res = await fetch(`/api/assets/${assetId}/download`);
  if (!res.ok) throw new Error(res.statusText);
  const { url } = (await res.json()) as { url: string };
  const r2Res = await fetch(url);
  if (!r2Res.ok) throw new Error(r2Res.statusText);
  return r2Res.blob();
}

async function fetchBlob(asset: { id: string; url?: string }): Promise<Blob> {
  if (asset.url) return fetch(asset.url).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText))));
  return fetchBlobFromDownloadRoute(asset.id);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/** Asset for download: id + filename required; url optional. When url is present, fetches directly and skips the /download API. */
export type DownloadableAsset = { id: string; filename: string; url?: string };

/**
 * Single asset: uses url when provided, else fetches signed URL from /download, then fetches blob from R2.
 * Multiple: same per file, then zips. Using fetch→blob→blobUrl ensures a.download is honoured for cross-origin R2.
 * Use from client only.
 */
export async function downloadAssets(
  assets: DownloadableAsset[],
  options?: { onError?: (filename: string) => void; zipName?: string },
): Promise<void> {
  if (assets.length === 0) return;

  if (assets.length === 1) {
    try {
      const blob = await fetchBlob(assets[0]);
      triggerBlobDownload(blob, assets[0].filename);
    } catch {
      options?.onError?.(assets[0].filename);
    }
    return;
  }

  const blobs: { blob: Blob; filename: string }[] = [];

  for (const asset of assets) {
    try {
      const blob = await fetchBlob(asset);
      blobs.push({ blob, filename: asset.filename });
    } catch {
      options?.onError?.(asset.filename);
    }
  }

  if (blobs.length === 0) return;

  const zip = new JSZip();
  const seen = new Map<string, number>();

  for (const { blob, filename } of blobs) {
    let name = filename;
    const n = (seen.get(filename) ?? 0) + 1;
    seen.set(filename, n);
    if (n > 1) {
      const lastDot = filename.lastIndexOf(".");
      name =
        lastDot === -1
          ? `${filename} (${n})`
          : `${filename.slice(0, lastDot)} (${n})${filename.slice(lastDot)}`;
    }
    zip.file(name, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(
    zipBlob,
    options?.zipName ? `${safeZipName(options.zipName)}.zip` : "assets.zip",
  );
}
