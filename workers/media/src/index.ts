interface Env {
  R2_BUCKET: R2Bucket;
  /** Shared secret with the Next.js app — set via `wrangler secret put MEDIA_TOKEN_SECRET` */
  MEDIA_TOKEN_SECRET: string;
  /** App origin for CORS (e.g. https://ugc.inbeat.agency) */
  ALLOWED_ORIGIN: string;
}

// ---------------------------------------------------------------------------
// HMAC token validation (mirrors token generation in the Next.js proxy route)
// ---------------------------------------------------------------------------

async function verifyToken(r2Key: string, token: string, secret: string): Promise<boolean> {
  try {
    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) return false;

    const expStr = token.slice(0, dotIndex);
    const sigHex = token.slice(dotIndex + 1);
    const exp = parseInt(expStr, 10);

    if (Number.isNaN(exp) || exp < Math.floor(Date.now() / 1000)) return false;

    // Recompute HMAC and do a constant-time comparison
    const message = new TextEncoder().encode(`${r2Key}:${exp}`);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, message);
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time string comparison to prevent timing attacks
    if (expected.length !== sigHex.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ sigHex.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Parse Range header into R2 get options format
// ---------------------------------------------------------------------------

type R2Range = { offset: number; length?: number } | { suffix: number };

function parseRange(rangeHeader: string | null): R2Range | undefined {
  if (!rangeHeader) return undefined;
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match) return undefined;
  const start = match[1];
  const end = match[2];
  if (!start) return end ? { suffix: parseInt(end, 10) } : undefined;
  const offset = parseInt(start, 10);
  if (Number.isNaN(offset)) return undefined;
  if (!end) return { offset };
  const endNum = parseInt(end, 10);
  if (Number.isNaN(endNum)) return { offset };
  return { offset, length: endNum - offset + 1 };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN;

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const url = new URL(request.url);
      const r2Key = decodeURIComponent(url.pathname.slice(1));
      if (!r2Key) return new Response("Not Found", { status: 404 });

      const token = url.searchParams.get("t");
      if (!token) return new Response("Unauthorized", { status: 401 });

      const valid = await verifyToken(r2Key, token, env.MEDIA_TOKEN_SECRET);
      if (!valid) return new Response("Unauthorized", { status: 401 });

      const rangeHeader = request.headers.get("Range");
      const range = parseRange(rangeHeader);

      const object = await env.R2_BUCKET.get(r2Key, range ? { range } : undefined);
      if (!object) return new Response("Not Found", { status: 404 });

      const headers = new Headers({
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": allowedOrigin,
      });

      if (object.httpMetadata?.contentType) {
        headers.set("Content-Type", object.httpMetadata.contentType);
      }

      if (range && object.range && "offset" in object.range) {
        const offset = object.range.offset ?? 0;
        const length = object.range.length ?? object.size - offset;
        headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
        headers.set("Content-Length", String(length));
        return new Response(object.body, { status: 206, headers });
      }

      headers.set("Content-Length", String(object.size));
      return new Response(object.body, { status: 200, headers });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(`Internal Error: ${message}`, { status: 500 });
    }
  },
};
