"use server";

import { createApplicant } from "@/features/applicants/lib/create-applicant";
import { type ApplyFormInput, applyFormSchema } from "@/features/applicants/schemas";
import { toActionError } from "@/shared/lib/action-error";

export async function submitApplication(input: ApplyFormInput) {
  try {
    const data = applyFormSchema.parse(input);

    return await createApplicant({
      fullName: data.fullName,
      email: data.email,
      country: data.country,
      languages: data.languages,
      socialChannels: {
        instagram_url: data.instagram_url || undefined,
        tiktok_url: data.tiktok_url || undefined,
        youtube_url: data.youtube_url || undefined,
      },
      portfolioUrl: data.portfolioUrl || undefined,
    });
  } catch (err) {
    throw toActionError(err);
  }
}
