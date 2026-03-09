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
        instagram_handle: data.instagram_handle || undefined,
        tiktok_handle: data.tiktok_handle || undefined,
        youtube_handle: data.youtube_handle || undefined,
      },
      portfolioUrl: data.portfolioUrl || undefined,
    });
  } catch (err) {
    throw toActionError(err);
  }
}
