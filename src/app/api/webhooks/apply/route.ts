import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createApplicant } from "@/features/applicants/lib/create-applicant";
import { LANGUAGES } from "@/shared/lib/constants";
import { env } from "@/shared/lib/env";

const bodySchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  country: z.string().min(1, "Required"),
  languages: z.array(z.enum(LANGUAGES)).min(1, "Required"),
  socialChannels: z
    .object({
      instagram_handle: z.string().optional(),
      tiktok_handle: z.string().optional(),
      youtube_handle: z.string().optional(),
      other_links: z.array(z.string()).optional(),
    })
    .optional(),
  portfolioUrl: z.url().optional(),
});

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    // Buffer lengths differ — invalid signature
    return false;
  }
}

export async function POST(req: Request) {
  const secret = env.APPLY_WEBHOOK_SECRET;

  const signature = req.headers.get("x-webhook-signature") ?? "";
  const rawBody = await req.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await createApplicant(parsed);

  if (!result.success && result.conflict) {
    return NextResponse.json({ error: "Email already has an active record" }, { status: 409 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
