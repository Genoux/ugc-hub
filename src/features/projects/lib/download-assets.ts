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

function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Single asset: fetches signed URL from /download, then fetches blob from R2 directly.
 * Using fetch→blob→blobUrl (same-origin) ensures a.download is honoured for cross-origin R2 URLs.
 * Multiple: same fetch-from-R2 pattern per file, then zips into one download.
 * Use from client only.
 */
export async function downloadAssets(
  assets: { id: string; filename: string }[],
  options?: { onError?: (filename: string) => void; zipName?: string },
): Promise<void> {
  if (assets.length === 0) return;

  if (assets.length === 1) {
    try {
      const blob = await fetchBlobFromDownloadRoute(assets[0].id);
      triggerBlobDownload(blob, assets[0].filename);
    } catch {
      options?.onError?.(assets[0].filename);
    }
    return;
  }

  const blobs: { blob: Blob; filename: string }[] = [];

  for (const asset of assets) {
    try {
      const blob = await fetchBlobFromDownloadRoute(asset.id);
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
