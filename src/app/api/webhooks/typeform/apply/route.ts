import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createApplicant } from "@/features/applicants/lib/create-applicant";
import { LANGUAGES } from "@/features/creators/constants";
import { env } from "@/shared/lib/env";

// Field refs from the Typeform form
const FIELD_REFS = {
  fullName: "d566770d2197a78b",
  socialProfile: "406a3e26-acd5-4229-99c9-bdfa4048d56d",
  portfolioUrl: "d531dc60-4146-432a-bcb1-2ba550f28069",
  languages: "96cc1d80-2344-4f46-8e5d-cc0270748963",
  country: "27aee133-5a8e-455c-b22a-d13cebbc1251",
  email: "4150e35efbf41b8a",
} as const;

const answerSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  email: z.string().optional(),
  url: z.string().optional(),
  choices: z.object({ labels: z.array(z.string()), other: z.string().optional() }).optional(),
  field: z.object({ ref: z.string() }),
});

const typeformPayloadSchema = z.object({
  event_type: z.literal("form_response"),
  form_response: z.object({
    answers: z.array(answerSchema),
  }),
});

function verifyTypeformSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret).update(payload).digest("base64");
  const expected = `sha256=${hmac}`;
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function getAnswer(answers: z.infer<typeof answerSchema>[], ref: string) {
  return answers.find((a) => a.field.ref === ref);
}

type SocialChannels = NonNullable<Parameters<typeof createApplicant>[0]["socialChannels"]>;

// Returns null for unrecognized platforms — we only store known handles
function parseSocialUrl(url: string): SocialChannels | null {
  try {
    const { hostname, pathname } = new URL(url);
    const domain = hostname.replace(/^www\./, "");
    const segments = pathname.split("/").filter(Boolean);

    if (domain === "instagram.com" || domain === "instagr.am") {
      const handle = segments[0];
      if (handle) return { instagram_handle: handle };
    }

    if (domain === "tiktok.com") {
      const segment = segments[0];
      // TikTok paths are /@username
      const handle = segment?.startsWith("@") ? segment.slice(1) : segment;
      if (handle) return { tiktok_handle: handle };
    }

    if (domain === "youtube.com" || domain === "youtu.be") {
      // Handles /c/name, /@handle, /user/name, /channel/UCxxx
      const handle = segments[0]?.startsWith("@") ? segments[0] : (segments[1] ?? segments[0]);
      if (handle) return { youtube_handle: handle };
    }
  } catch {
    // Invalid URL
  }

  return null;
}

export async function POST(req: Request) {
  const signature = req.headers.get("typeform-signature") ?? "";
  const rawBody = await req.text();

  if (!verifyTypeformSignature(rawBody, signature, env.TYPEFORM_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: z.infer<typeof typeformPayloadSchema>;
  try {
    parsed = typeformPayloadSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const answers = parsed.form_response.answers;

  const fullName = getAnswer(answers, FIELD_REFS.fullName)?.text;
  const email = getAnswer(answers, FIELD_REFS.email)?.email;

  if (!fullName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const country = getAnswer(answers, FIELD_REFS.country)?.text;
  const portfolioUrl = getAnswer(answers, FIELD_REFS.portfolioUrl)?.url;
  const socialProfileUrl = getAnswer(answers, FIELD_REFS.socialProfile)?.url;
  const languagesAnswer = getAnswer(answers, FIELD_REFS.languages);

  // Map Typeform labels to LANGUAGES enum; treat custom "other" text entry as "Other"
  const languages = languagesAnswer?.choices
    ? [
        ...languagesAnswer.choices.labels.filter((l): l is (typeof LANGUAGES)[number] =>
          (LANGUAGES as readonly string[]).includes(l),
        ),
        ...(languagesAnswer.choices.other ? (["Other"] as const) : []),
      ]
    : undefined;

  const result = await createApplicant({
    fullName,
    email,
    country,
    languages: languages?.length ? languages : undefined,
    socialChannels: socialProfileUrl ? (parseSocialUrl(socialProfileUrl) ?? undefined) : undefined,
    portfolioUrl,
  });

  if (!result.success && result.conflict) {
    return NextResponse.json({ error: "Email already has an active record" }, { status: 409 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
