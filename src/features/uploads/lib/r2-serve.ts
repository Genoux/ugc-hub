import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_BUCKET_NAME, r2Client } from "./r2-client";

const URL_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days
// Refresh 1 hour before expiry so cached URLs never go stale mid-session
const CACHE_TTL_MS = (URL_EXPIRES_SECONDS - 60 * 60) * 1000;

const urlCache = new Map<string, { url: string; expiresAt: number }>();

export async function getR2SignedUrl(r2Key: string | null | undefined): Promise<string | null> {
  if (!r2Key) return null;

  const cached = urlCache.get(r2Key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key });
  const url = await getSignedUrl(r2Client, command, { expiresIn: URL_EXPIRES_SECONDS });

  urlCache.set(r2Key, { url, expiresAt: Date.now() + CACHE_TTL_MS });

  return url;
}

export function r2JsonResponse(signedUrl: string): Response {
  return Response.json(
    { url: signedUrl },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
