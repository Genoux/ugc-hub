/** Converts an R2 key to an auth-gated media proxy URL. */
export function toMediaUrl(r2Key: string | null | undefined): string | null {
  if (!r2Key) return null;
  return `/api/media/${r2Key}`;
}
