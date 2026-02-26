"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/features/wizard/components/wizard-shell";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/lib/routes";

export type SubmitPageView =
  | { view: "closed" }
  | { view: "unavailable"; status: string }
  | { view: "pending_applicant" }
  | {
      view: "wizard";
      token: string;
      submissionName: string;
      creatorId: string;
      creatorName: string;
      creatorEmail: string;
      creatorImageUrl: string | null;
    };

export function SubmitPageClient({ view }: { view: SubmitPageView }) {
  const router = useRouter();

  if (view.view === "closed") {
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

  if (view.view === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Not Available</h1>
            <p className="mt-2 text-sm text-muted-foreground">This submission is {view.status}.</p>
          </div>
        </div>
      </div>
    );
  }

  if (view.view === "pending_applicant") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 justify-start items-start">
              <h1 className="text-2xl font-semibold">Pending Approval</h1>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your application is under review. You'll be able to upload once approved.
              </p>
            </div>
            <div className="flex gap-2 w-full justify-start">
              <Button variant="outline" onClick={() => router.push(ROUTES.signOut)}>
                Sign out
              </Button>
              <Button variant="default" onClick={() => router.push(ROUTES.creatorHome)}>
                Go to my profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WizardShell
      token={view.token}
      submissionName={view.submissionName}
      creatorId={view.creatorId}
      creatorName={view.creatorName}
      creatorEmail={view.creatorEmail}
      creatorImageUrl={view.creatorImageUrl}
    />
  );
}
