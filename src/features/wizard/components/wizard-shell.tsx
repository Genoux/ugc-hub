"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMultipartUpload } from "@/features/uploads/hooks/use-multipart-upload";
import { submitWizard } from "../actions/submit-wizard";
import { useWizardState } from "../hooks/use-wizard-state";
import { WizardStepOne } from "./wizard-step-one";
import { WizardStepThree } from "./wizard-step-three";
import { WizardStepTwo } from "./wizard-step-two";

export function WizardShell({
  token,
  campaignName,
}: {
  token: string;
  campaignName: string;
}) {
  const router = useRouter();
  const { step, stepOneData, stepTwoFiles } = useWizardState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile } = useMultipartUpload();

  async function handleSubmit() {
    if (!stepOneData) return;

    setIsSubmitting(true);
    let submissionId: string | null = null;

    try {
      const submission = await submitWizard({
        token,
        creatorName: stepOneData.creatorName,
        creatorEmail: stepOneData.creatorEmail,
      });

      submissionId = submission.id;

      if (stepTwoFiles.length > 0) {
        await Promise.all(stepTwoFiles.map((file) => uploadFile(file, submission.id)));
      }

      router.replace(`/submit/${token}`);
    } catch (error) {
      console.error("Submission failed:", error);

      if (submissionId) {
        try {
          await fetch("/api/submissions/rollback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId }),
          });
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }

      toast.error("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold">Submitting</h2>
            <p className="mt-1 text-sm text-muted-foreground">Processing your submission...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{campaignName}</h1>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s === step ? "bg-primary" : s < step ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          {step === 1 && <WizardStepOne />}
          {step === 2 && <WizardStepTwo />}
          {step === 3 && <WizardStepThree onSubmit={handleSubmit} />}
        </div>
      </div>
    </div>
  );
}
