import { createHmac } from "node:crypto";
import { env } from "@/shared/lib/env";

/** Encode each path segment so `#`, `?`, `%`, etc. in object keys do not break URL parsing. */
function encodeR2KeyPath(r2Key: string): string {
  return r2Key.split("/").map(encodeURIComponent).join("/");
}

/**
 * Generates a direct CF Worker URL with an HMAC-signed token.
 * The token is snapped to a 2-hour floor so it's stable within a window, allowing
 * the browser to cache the URL without hitting the Next.js function on every load.
 * Returns null when the Worker is not configured or when r2Key is falsy.
 */
export function toWorkerUrl(
  r2Key: string | null | undefined,
  version?: Date | string | number | null,
): string | null {
  if (!r2Key) return null;
  if (!env.MEDIA_WORKER_URL || !env.MEDIA_TOKEN_SECRET) return null;
  const twoHourFloor = Math.floor(Date.now() / 7_200_000) * 7200;
  const exp = twoHourFloor + 7200;
  const sig = createHmac("sha256", env.MEDIA_TOKEN_SECRET).update(`${r2Key}:${exp}`).digest("hex");
  const url = new URL(`${env.MEDIA_WORKER_URL}/${encodeR2KeyPath(r2Key)}`);
  url.searchParams.set("t", `${exp}.${sig}`);
  if (version != null) {
    const v = version instanceof Date ? version.getTime() : version;
    url.searchParams.set("v", String(v));
  }
  return url.toString();
}
