"use server";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import { createApplicant } from "@/features/applicants/lib/create-applicant";
import { type ApplyFormInput, applyFormSchema } from "@/features/applicants/schemas";
import { notifySlack } from "@/integrations/slack/notify-slack";
import { toActionError } from "@/shared/lib/action-error";

export async function submitApplication(input: ApplyFormInput) {
  try {
    const data = applyFormSchema.parse(input);

    const result = await createApplicant({
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

    if (result.success) {
      Sentry.logger.info("Application submitted", {
        log_source: "apply",
        email: data.email,
        full_name: data.fullName,
        country: data.country,
      });
      after(() =>
        notifySlack({
          type: "creator_apply",
          fullName: data.fullName,
          email: data.email,
          country: data.country,
          languages: data.languages,
          instagram_url: data.instagram_url || undefined,
          tiktok_url: data.tiktok_url || undefined,
          youtube_url: data.youtube_url || undefined,
          portfolioUrl: data.portfolioUrl || undefined,
          appliedAt: new Date(),
        }),
      );
    }

    return result;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { action: "submit-application" },
      extra: { email: input.email },
    });
    throw toActionError(err);
  }
}
