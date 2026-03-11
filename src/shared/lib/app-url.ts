import { headers } from "next/headers";

/**
 * Returns the app origin (e.g. https://example.com) from the current request.
 * Use in server actions / route handlers; requires request context.
 */
export async function getAppUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  if (!host) throw new Error("Cannot determine app URL: no host in request headers");
  return `${proto}://${host}`;
}
