import JSZip from "jszip";

function safeZipName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, "_").trim() || "download";
}

/**
 * Single asset: links to /api/assets/[id]/file (Content-Disposition: attachment) so the browser downloads.
 * Multiple: fetches each from /file, zips, then triggers one download.
 * Use from client only.
 */
export async function downloadAssets(
  assets: { id: string; filename: string }[],
  options?: { onError?: (filename: string) => void; zipName?: string },
): Promise<void> {
  if (assets.length === 0) return;

  if (assets.length === 1) {
    const a = document.createElement("a");
    a.href = `/api/assets/${assets[0].id}/file`;
    a.download = assets[0].filename;
    a.click();
    return;
  }

  const blobs: { blob: Blob; filename: string }[] = [];

  for (const asset of assets) {
    try {
      const res = await fetch(`/api/assets/${asset.id}/file`);
      if (!res.ok) throw new Error(res.statusText);
      const blob = await res.blob();
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
  const zipUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = zipUrl;
  a.download = options?.zipName ? `${safeZipName(options.zipName)}.zip` : "assets.zip";
  a.click();
  URL.revokeObjectURL(zipUrl);
}
