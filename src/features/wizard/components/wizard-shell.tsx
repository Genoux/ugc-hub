"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMultipartUpload } from "@/features/uploads/hooks/use-multipart-upload";
import { Button } from "@/shared/components/ui/button";
import { submitWizard } from "../actions/submit-wizard";
import { useWizardState } from "../hooks/use-wizard-state";
import { WizardStepOne } from "./wizard-step-one";
import { WizardStepThree } from "./wizard-step-three";
import { WizardStepTwo } from "./wizard-step-two";

interface WizardShellProps {
  token: string;
  submissionName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string | null;
}

export function WizardShell({
  token,
  submissionName,
  creatorId,
  creatorName,
  creatorEmail,
  creatorImageUrl,
}: WizardShellProps) {
  const { step, stepTwoFiles, reset } = useWizardState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { uploadFile } = useMultipartUpload();

  const creatorProps = { creatorName, creatorEmail, creatorImageUrl };

  async function handleSubmit() {
    setIsSubmitting(true);
    let batchId: string | null = null;

    try {
      const result = await submitWizard({ token, creatorId });
      batchId = result.batch.id;

      if (stepTwoFiles.length > 0) {
        await Promise.all(
          stepTwoFiles.map((file) =>
            uploadFile(file, result.project.id, result.folder.id, result.batch.id),
          ),
        );
      }

      reset();
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed:", error);

      if (batchId) {
        try {
          await fetch("/api/projects/rollback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId: batchId }),
          });
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }

      toast.error("Failed to submit. Please try again.");
    } finally {
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
            <p className="mt-1 text-sm text-muted-foreground">Uploading your files...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <div>
            <h2 className="text-xl font-semibold">Submitted!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your files have been received. Thank you!
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSuccess(false)}>
              Submit more files
            </Button>
            <Button variant="ghost" asChild>
              <a href="/creator">Go to my profile</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{submissionName}</h1>
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
          {step === 1 && <WizardStepOne {...creatorProps} />}
          {step === 2 && <WizardStepTwo />}
          {step === 3 && <WizardStepThree {...creatorProps} onSubmit={handleSubmit} />}
        </div>
      </div>
    </div>
  );
}
