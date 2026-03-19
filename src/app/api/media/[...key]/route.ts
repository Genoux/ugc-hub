import { createHmac } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { env } from "@/shared/lib/env";

const BROWSER_MAX_AGE = 3600;
const BROWSER_STALE_WHILE_REVALIDATE = 86400;

function makeEtag(r2Key: string, version: string | null): string {
  return `"${Buffer.from(`${r2Key}:${version ?? "none"}`).toString("base64")}"`;
}

function makeWorkerToken(r2Key: string, secret: string): string {
  const twoHourFloor = Math.floor(Date.now() / 7_200_000) * 7200;
  const exp = twoHourFloor + 7200;
  const sig = createHmac("sha256", secret).update(`${r2Key}:${exp}`).digest("hex");
  return `${exp}.${sig}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const r2Key = key.join("/");
  const url = new URL(request.url);
  const version = url.searchParams.get("v");
  const rangeHeader = request.headers.get("range");

  const cacheControl = `private, max-age=${BROWSER_MAX_AGE}, stale-while-revalidate=${BROWSER_STALE_WHILE_REVALIDATE}`;

  // Redirect to CF Worker when configured — bytes never touch Next.js
  if (env.MEDIA_WORKER_URL && env.MEDIA_TOKEN_SECRET) {
    const token = makeWorkerToken(r2Key, env.MEDIA_TOKEN_SECRET);
    const workerUrl = new URL(`${env.MEDIA_WORKER_URL}/${r2Key}`);
    workerUrl.searchParams.set("t", token);
    if (version) workerUrl.searchParams.set("v", version);
    return new Response(null, {
      status: 307,
      headers: {
        Location: workerUrl.toString(),
        "Cache-Control": `private, max-age=${BROWSER_MAX_AGE}`,
      },
    });
  }

  // Fallback: stream directly from R2 through Next.js (no Worker configured)
  const etag = makeEtag(r2Key, version);
  if (!rangeHeader && request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { "cache-control": cacheControl, etag } });
  }

  const signedUrl = await getR2SignedUrl(r2Key);
  if (!signedUrl) return new Response("Not found", { status: 404 });

  const r2Response = await fetch(signedUrl, {
    headers: rangeHeader ? { Range: rangeHeader } : {},
  });

  if (!r2Response.ok && r2Response.status !== 206) {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "cache-control": cacheControl,
    "accept-ranges": "bytes",
    etag,
  };
  const contentType = r2Response.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  const contentLength = r2Response.headers.get("content-length");
  if (contentLength) headers["content-length"] = contentLength;
  const contentRange = r2Response.headers.get("content-range");
  if (contentRange) headers["content-range"] = contentRange;

  return new Response(r2Response.body, { status: r2Response.status, headers });
}
