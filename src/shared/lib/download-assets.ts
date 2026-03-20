import JSZip from "jszip";

function safeZipName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, "_").trim() || "download";
}

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.blob();
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/** Asset for download: filename + url required. */
export type DownloadableAsset = { filename: string; url: string };

/**
 * Single asset: fetches blob directly from the worker URL and triggers download.
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
      const blob = await fetchBlob(assets[0].url);
      triggerBlobDownload(blob, assets[0].filename);
    } catch {
      options?.onError?.(assets[0].filename);
    }
    return;
  }

  const results = await Promise.allSettled(
    assets.map((a) => fetchBlob(a.url).then((blob) => ({ blob, filename: a.filename }))),
  );

  const blobs = results.flatMap((r, i) => {
    if (r.status === "fulfilled") return [r.value];
    options?.onError?.(assets[i].filename);
    return [];
  });

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
