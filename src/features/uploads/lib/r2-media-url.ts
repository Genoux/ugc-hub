/** Converts an R2 key to an auth-gated media proxy URL.
 *  Pass `version` to bust browser cache when the file at a deterministic key changes. */
export function toMediaUrl(
  r2Key: string | null | undefined,
  version?: Date | string | number | null,
): string | null {
  if (!r2Key) return null;
  const base = `/api/media/${r2Key}`;
  if (!version) return base;
  const v = version instanceof Date ? version.getTime() : version;
  return `${base}?v=${v}`;
}
