import { ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export type ApplicantData = {
  fullName: string;
  email: string;
  country: string;
  languages: string[];
  socialChannels?: {
    instagram_url?: string;
    tiktok_url?: string;
    youtube_url?: string;
    other_links?: string[];
  };
  portfolioUrl?: string;
};

export type CreateApplicantResult =
  | { success: true }
  | { success: false; conflict: true }
  | { success: false; conflict: false; error: unknown };

export async function createApplicant(data: ApplicantData): Promise<CreateApplicantResult> {
  const existing = await db.query.creators.findFirst({
    where: ilike(creators.email, data.email),
    columns: { id: true },
  });

  if (existing) {
    return { success: false, conflict: true };
  }

  try {
    await db.insert(creators).values({
      fullName: data.fullName,
      email: data.email,
      country: data.country,
      languages: data.languages,
      socialChannels: data.socialChannels,
      portfolioUrl: data.portfolioUrl,
      source: "applicant",
      status: "applicant",
      appliedAt: new Date(),
    });
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
    if (code === "23505") {
      return { success: false, conflict: true };
    }
    return { success: false, conflict: false, error: err };
  }

  revalidatePath("/applicants");
  return { success: true };
}
