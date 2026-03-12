import { auth } from "@clerk/nextjs/server";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";

const BROWSER_MAX_AGE = 3600; // 1 hour
const BROWSER_STALE_WHILE_REVALIDATE = 86400; // 24 hours
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX_ENTRIES = 200;

const responseCache = new Map<
  string,
  { body: ArrayBuffer; contentType: string; contentLength: string; cachedAt: number }
>();

function cacheKey(r2Key: string, version: string | null): string {
  return `${r2Key}:${version ?? "none"}`;
}

function evictOldest(): void {
  if (responseCache.size < CACHE_MAX_ENTRIES) return;
  const firstKey = responseCache.keys().next().value;
  if (firstKey !== undefined) responseCache.delete(firstKey);
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const r2Key = key.join("/");
  const version = new URL(request.url).searchParams.get("v");
  const rangeHeader = request.headers.get("range");
  const useByteCache = !rangeHeader;

  const cacheControl = `private, max-age=${BROWSER_MAX_AGE}, stale-while-revalidate=${BROWSER_STALE_WHILE_REVALIDATE}`;

  if (process.env.NODE_ENV === "development" && key[0]?.startsWith("http")) {
    const externalUrl = `${key[0]}//${key.slice(1).join("/")}` as string;
    if (externalUrl.startsWith("http://") || externalUrl.startsWith("https://")) {
      const res = await fetch(externalUrl, {
        headers: rangeHeader ? { Range: rangeHeader } : {},
      });
      if (!res.ok) return new Response("Not found", { status: 404 });
      const headers: Record<string, string> = {
        "cache-control": cacheControl,
        "accept-ranges": "bytes",
      };
      const ct = res.headers.get("content-type");
      if (ct) headers["content-type"] = ct;
      const cl = res.headers.get("content-length");
      if (cl) headers["content-length"] = cl;
      const cr = res.headers.get("content-range");
      if (cr) headers["content-range"] = cr;
      return new Response(res.body, { status: res.status, headers });
    }
  }

  if (useByteCache) {
    const keyStr = cacheKey(r2Key, version);
    const cached = responseCache.get(keyStr);
    if (cached && cached.cachedAt + CACHE_TTL_MS > Date.now()) {
      const headers: Record<string, string> = {
        "cache-control": cacheControl,
        "accept-ranges": "bytes",
        "content-type": cached.contentType,
        "content-length": cached.contentLength,
      };
      return new Response(cached.body, { status: 200, headers });
    }
  }

  const signedUrl = await getR2SignedUrl(r2Key);
  if (!signedUrl) return new Response("Not found", { status: 404 });

  const r2Response = await fetch(signedUrl, {
    headers: rangeHeader ? { Range: rangeHeader } : {},
  });

  if (!r2Response.ok && r2Response.status !== 206) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = r2Response.headers.get("content-type") ?? "";
  const contentLength = r2Response.headers.get("content-length") ?? "";
  const contentRange = r2Response.headers.get("content-range");

  if (useByteCache && r2Response.status === 200) {
    const body = await r2Response.arrayBuffer();
    evictOldest();
    responseCache.set(cacheKey(r2Key, version), {
      body,
      contentType,
      contentLength,
      cachedAt: Date.now(),
    });
    const headers: Record<string, string> = {
      "cache-control": cacheControl,
      "accept-ranges": "bytes",
      "content-type": contentType,
      "content-length": contentLength,
    };
    return new Response(body, { status: 200, headers });
  }

  const headers: Record<string, string> = {
    "cache-control": cacheControl,
    "accept-ranges": "bytes",
  };
  if (contentType) headers["content-type"] = contentType;
  if (contentLength) headers["content-length"] = contentLength;
  if (contentRange) headers["content-range"] = contentRange;

  return new Response(r2Response.body, { status: r2Response.status, headers });
}
