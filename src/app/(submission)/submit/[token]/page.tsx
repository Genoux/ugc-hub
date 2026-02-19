import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { creators, submissions } from "@/db/schema";
import { WizardShell } from "@/features/wizard/components/wizard-shell";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export const metadata: Metadata = {
  title: "inBeat - Asset Submissions",
};

export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.uploadToken, token),
  });

  if (!submission) {
    notFound();
  }

  if (submission.status === "closed") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-10" />
          <div>
            <h1 className="text-2xl font-semibold">Submission Complete!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Thank you for your submission.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submission.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Not Available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This submission is {submission.status}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Auth check — middleware handles the redirect but this is a fallback
  const { userId } = await auth();
  if (!userId) redirect(`${ROUTES.signIn}?redirect_url=/submit/${token}`);

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

  if (!primaryEmail) redirect(ROUTES.signIn);

  const creator = await db.query.creators.findFirst({
    where: or(eq(creators.clerkUserId, userId), eq(creators.email, primaryEmail)),
  });

  if (!creator) {
    // New user via upload link → create applicant record, show pending screen
    await db.insert(creators).values({
      fullName: clerkUser.fullName ?? primaryEmail.split("@")[0] ?? "Unknown",
      email: primaryEmail,
      clerkUserId: userId,
      source: "submission_link",
      status: "applicant",
      appliedAt: new Date(),
    });

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <Clock className="size-10 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Pending Approval</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account has been registered. An admin will review and approve you shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sync clerkUserId if not yet set
  if (!creator.clerkUserId) {
    await db.update(creators).set({ clerkUserId: userId }).where(eq(creators.id, creator.id));
  }

  // Pending applicants cannot upload yet
  if (creator.status === "applicant") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <Clock className="size-10 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Pending Approval</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your application is under review. You'll be able to upload once approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Approved (joined or approved_not_joined) → allow upload; profile completion not required
  // TODO: Use either profile photo or imageUrl from clerkUser
  return (
    <WizardShell
      token={token}
      submissionName={submission.name}
      creatorId={creator.id}
      creatorName={creator.fullName}
      creatorEmail={primaryEmail}
      creatorImageUrl={creator.profilePhoto ?? clerkUser.imageUrl ?? null}
    />
  );
}
