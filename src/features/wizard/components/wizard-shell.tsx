"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMultipartUpload } from "@/features/uploads/hooks/use-multipart-upload";
import { Button } from "@/shared/components/ui/button";
import {
  Wizard,
  WizardDescription,
  WizardFooter,
  WizardPanel,
  WizardStep,
  WizardTitle,
} from "@/shared/components/wizard/wizard";
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import { submitWizard } from "../actions/submit-wizard";
import { WizardStepComplete } from "./steps/step-complete";
import { WizardStepLoading } from "./steps/step-loading";
import { StepSubmittingAs } from "./steps/step-submitting-as";
import { StepUploadAssets } from "./steps/step-upload-assets";
import { WIZARD_STEPS } from "./wizard-constants";
import { WizardStepDevTool } from "./wizard-step-dev-tool";

const TOTAL_STEPS = 4;

interface WizardShellProps {
  token: string;
  projectName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string;
}

export function WizardShell({
  token,
  creatorId,
  creatorName,
  creatorEmail,
  creatorImageUrl,
  projectName,
}: WizardShellProps) {
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [simulateSubmitError, setSimulateSubmitError] = useState(false);
  const { uploadFile } = useMultipartUpload();

  const isLoadingStep = step === 3;
  const isResultStep = step === TOTAL_STEPS;

  const creatorProps = { creatorName, creatorEmail, creatorImageUrl, projectName };

  function handleBack() {
    goToStep(step - 1);
  }

  function handleNext() {
    goToStep(step + 1);
  }

  async function handleSubmit() {
    goToStep(3);
    setIsSubmitting(true);
    setUploadProgress(0);
    let submissionId: string | null = null;

    try {
      const result = await submitWizard({ token, creatorId });
      submissionId = result.submission.id;
      setUploadProgress(20);

      if (uploadFiles.length > 0) {
        const n = uploadFiles.length;
        const fileProgress = new Array<number>(n).fill(0);
        await Promise.all(
          uploadFiles.map((file, i) =>
            uploadFile(file, result.project.id, result.folder.id, result.submission.id, {
              onProgress: (p) => {
                fileProgress[i] = p / 100;
                const total = fileProgress.reduce((a, b) => a + b, 0) / n;
                setUploadProgress(20 + 80 * total);
              },
            }),
          ),
        );
      } else {
        setUploadProgress(100);
      }

      goToStep(TOTAL_STEPS);
      setUploadFiles([]);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Submission failed:", error);

      if (submissionId) {
        try {
          await fetch("/api/projects/rollback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId }),
          });
        } catch (rollbackError) {
          if (process.env.NODE_ENV === "development")
            console.error("Rollback failed:", rollbackError);
        }
      }

      toast.error("Failed to submit. Please try again.");
      goToStep(2);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <WizardStepDevTool currentStep={step} onGoToStep={goToStep} />
      <Wizard variant="page">
        <WizardPanel>
          <WizardStep stepKey={step} direction={directionRef.current}>
            {!isResultStep && !isLoadingStep && (
              <div className="flex flex-col gap-2">
                <WizardTitle>{WIZARD_STEPS[step].header}</WizardTitle>
                <WizardDescription>{WIZARD_STEPS[step].body}</WizardDescription>
              </div>
            )}
            {step === 1 && <StepSubmittingAs {...creatorProps} />}
            {step === 2 && (
              <StepUploadAssets
                {...creatorProps}
                files={uploadFiles}
                onFilesChange={setUploadFiles}
              />
            )}
            {step === 3 && <WizardStepLoading progress={uploadProgress} />}
            {step === 4 && <WizardStepComplete />}
            {!isResultStep && !isLoadingStep && (
              <WizardFooter>
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 2 ? (
                  <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploadFiles.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Submitting…" : "Submit"}
                  </Button>
                )}
              </WizardFooter>
            )}
          </WizardStep>
        </WizardPanel>
      </Wizard>
    </>
  );
}
