/**
 * Uploads a file directly to R2 using a presigned PUT URL.
 * Shared primitive across all upload flows — auth and validation happen server-side.
 */
export async function putToR2(file: File, uploadUrl: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
}
