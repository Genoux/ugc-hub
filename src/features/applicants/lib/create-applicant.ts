import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export type ApplicantData = {
  fullName: string;
  email: string;
  country: string;
  languages?: string[];
  socialChannels?: {
    instagram_handle?: string;
    tiktok_handle?: string;
    youtube_handle?: string;
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
    where: eq(creators.email, data.email),
    columns: { id: true, status: true },
  });

  if (existing && existing.status !== "rejected") {
    return { success: false, conflict: true };
  }

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

  return { success: true };
}
