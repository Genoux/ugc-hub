"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Wizard,
  WizardDescription,
  WizardFooter,
  WizardPanel,
  WizardStep,
  WizardTitle,
} from "@/shared/components/wizard/wizard";
import { WizardComplete } from "@/shared/components/wizard/wizard-complete";
import { WizardLoading } from "@/shared/components/wizard/wizard-loading";
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import { ROUTES } from "@/shared/lib/routes";
import { submitWizard } from "../actions/submit-wizard";
import { useSubmissionUpload } from "../hooks/use-submission-upload";
import { SUBMISSION_WIZARD_STEPS } from "../lib/submission-wizard-constants";
import { StepSubmittingAs } from "./steps/step-submitting-as";
import { StepUploadAssets } from "./steps/step-upload-assets";

const CONTENT_STEPS = Object.keys(SUBMISSION_WIZARD_STEPS).length;
const LOADING_STEP = CONTENT_STEPS + 1;
const COMPLETE_STEP = CONTENT_STEPS + 2;
const TOTAL_STEPS = COMPLETE_STEP;

interface SubmissionWizardShellProps {
  token: string;
  projectName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string;
}

export function SubmissionWizardShell({
  token,
  creatorId,
  creatorName,
  creatorEmail,
  creatorImageUrl,
  projectName,
}: SubmissionWizardShellProps) {
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { upload, setContext } = useSubmissionUpload((p) => setUploadProgress(20 + 80 * (p / 100)));

  const isLoadingStep = step === LOADING_STEP;
  const isResultStep = step === COMPLETE_STEP;
  const router = useRouter();
  const creatorProps = { creatorName, creatorEmail, creatorImageUrl, projectName };

  function handleBack() {
    goToStep(step - 1);
  }

  function handleNext() {
    goToStep(step + 1);
  }

  async function handleSubmit() {
    goToStep(LOADING_STEP);
    setIsSubmitting(true);
    setUploadProgress(0);
    let submissionId: string | null = null;

    try {
      const result = await submitWizard({ token, creatorId });
      submissionId = result.submission.id;
      setUploadProgress(20);

      if (uploadFiles.length > 0) {
        setContext({
          projectId: result.project.id,
          folderId: result.folder.id,
          submissionId: result.submission.id,
        });
        await upload(uploadFiles);
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
    <Wizard variant="page">
      <WizardPanel>
        <WizardStep stepKey={step} direction={directionRef.current}>
          {!isResultStep && !isLoadingStep && (
            <div className="flex flex-col gap-2">
              <WizardTitle>{SUBMISSION_WIZARD_STEPS[step].header}</WizardTitle>
              <WizardDescription>{SUBMISSION_WIZARD_STEPS[step].body}</WizardDescription>
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
          {step === LOADING_STEP && (
            <WizardLoading
              title="Submitting"
              description="Uploading your files, please don't close this page."
              progress={uploadProgress}
            />
          )}
          {step === 4 && (
            <WizardComplete
              title="Submission complete!"
              description="Your files have been received."
              className="flex justify-center items-center"
            >
              <Button onClick={() => router.push(ROUTES.creatorHome)} className="w-fit">
                Go to my profile
              </Button>
            </WizardComplete>
          )}
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
  );
}
