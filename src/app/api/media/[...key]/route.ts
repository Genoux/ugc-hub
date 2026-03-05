import { auth } from "@clerk/nextjs/server";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const r2Key = key.join("/");

  if (process.env.NODE_ENV === "development" && key[0]?.startsWith("http")) {
    const externalUrl = (key[0] + "//" + key.slice(1).join("/")) as string;
    if (externalUrl.startsWith("http://") || externalUrl.startsWith("https://")) {
      const res = await fetch(externalUrl, {
        headers: request.headers.get("range") ? { Range: request.headers.get("range")! } : {},
      });
      if (!res.ok) return new Response("Not found", { status: 404 });
      const headers: Record<string, string> = {
        "cache-control": "private, no-store",
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

  const signedUrl = await getR2SignedUrl(r2Key);
  if (!signedUrl) return new Response("Not found", { status: 404 });

  const rangeHeader = request.headers.get("range");
  const r2Response = await fetch(signedUrl, {
    headers: rangeHeader ? { Range: rangeHeader } : {},
  });

  if (!r2Response.ok && r2Response.status !== 206) {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "cache-control": "private, no-store",
    "accept-ranges": "bytes",
  };

  const contentType = r2Response.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  const contentLength = r2Response.headers.get("content-length");
  if (contentLength) headers["content-length"] = contentLength;

  const contentRange = r2Response.headers.get("content-range");
  if (contentRange) headers["content-range"] = contentRange;

  return new Response(r2Response.body, { status: r2Response.status, headers });
}
