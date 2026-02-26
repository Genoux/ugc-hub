import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { creators } from "@/db/schema";
import { LANGUAGES } from "@/features/creators/constants";
import { db } from "@/shared/lib/db";
import { env } from "@/shared/lib/env";

const bodySchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  country: z.string().optional(),
  languages: z.array(z.enum(LANGUAGES)).optional(),
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

  // Reject duplicate active applications
  const existing = await db.query.creators.findFirst({
    where: eq(creators.email, parsed.email),
    columns: { id: true, status: true },
  });

  if (existing && existing.status !== "rejected") {
    return NextResponse.json({ error: "Email already has an active record" }, { status: 409 });
  }

  await db.insert(creators).values({
    fullName: parsed.fullName,
    email: parsed.email,
    country: parsed.country,
    // DB stores languages as { language, accent? } objects
    languages: parsed.languages,
    socialChannels: parsed.socialChannels,
    portfolioUrl: parsed.portfolioUrl,
    source: "applicant",
    status: "applicant",
    appliedAt: new Date(),
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
