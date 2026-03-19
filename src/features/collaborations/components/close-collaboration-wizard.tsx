"use client";

import { X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Wizard,
  WizardDescription,
  WizardFooter,
  WizardHeader,
  WizardPanel,
  WizardStep,
  WizardTitle,
} from "@/shared/components/wizard/wizard";
import { WizardComplete } from "@/shared/components/wizard/wizard-complete";
import { WizardLoading } from "@/shared/components/wizard/wizard-loading";
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import type { CollabRatingRow } from "@/shared/lib/calculate-ratings";
import { calculateCreatorRating } from "@/shared/lib/calculate-ratings";
import { closeCollaboration } from "../actions/close-collaboration";
import { usePortfolioUpload } from "../hooks/use-portfolio-upload";
import { useWizardCloseGuard } from "../hooks/use-wizard-close-guard";
import { CLOSE_WIZARD_STEPS } from "../lib/close-wizard-constants";
import { canProceed } from "../lib/close-wizard-utils";
import type { CollaborationRatingsInput } from "../schemas";
import { CreatorWizardAside } from "./creator-wizard-aside";
import { StepCloseConfirm } from "./steps/step-close-confirm";
import { type PortfolioFile, StepPortfolio } from "./steps/step-portfolio";
import { StepRates } from "./steps/step-rates";
import { StepRatings } from "./steps/step-ratings";

const CONTENT_STEPS = Object.keys(CLOSE_WIZARD_STEPS).length;
const LOADING_STEP = CONTENT_STEPS + 1;
const COMPLETE_STEP = CONTENT_STEPS + 2;
const TOTAL_STEPS = COMPLETE_STEP;

interface CloseCollaborationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  collaborationId: string;
  creatorId: string;
  creatorName: string;
  profilePhotoUrl: string;
  submissionName: string;
  closedCollabRatings: CollabRatingRow[];
}

export function CloseCollaborationWizard({
  onClose,
  onSuccess,
  collaborationId,
  creatorId,
  creatorName,
  profilePhotoUrl,
  submissionName,
  closedCollabRatings,
}: CloseCollaborationWizardProps) {
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [ratings, setRatings] = useState<Partial<CollaborationRatingsInput>>({});
  const [piecesOfContent, setPiecesOfContent] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<PortfolioFile[]>([]);
  const [isPending, startTransition] = useTransition();

  const isLoadingStep = step === LOADING_STEP;
  const isCompleteStep = step === COMPLETE_STEP;
  const isResultStep = isLoadingStep || isCompleteStep;

  const stepCanProceed = canProceed(step, ratings, piecesOfContent, totalPaid, portfolioFiles);

  const _filledSteps = new Set(
    Object.keys(CLOSE_WIZARD_STEPS)
      .map(Number)
      .filter(
        (s) => s >= step || canProceed(s, ratings, piecesOfContent, totalPaid, portfolioFiles),
      ),
  );

  const onFilePersisted = useCallback(
    async (args: { key: string; filename: string; mimeType: string; sizeBytes: number }) => {
      const completeRes = await fetch("/api/uploads/portfolio/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationId,
          key: args.key,
          filename: args.filename,
          mimeType: args.mimeType,
          sizeBytes: args.sizeBytes,
        }),
      });
      if (!completeRes.ok) throw new Error("Failed to register upload");
    },
    [collaborationId],
  );

  const { uploadProgress, setUploadProgress, isUploading, setIsUploading, uploadFiles } =
    usePortfolioUpload({
      creatorId,
      sessionId: collaborationId,
      onFilePersisted,
    });

  function handleDone() {
    onSuccess();
    onClose();
  }

  const hasChanges = () =>
    Object.keys(ratings).length > 0 ||
    piecesOfContent !== "" ||
    totalPaid !== "" ||
    notes !== "" ||
    portfolioFiles.length > 0;

  const { confirmingClose, handleRequestClose, onAlertOpenChange, discardAndClose } =
    useWizardCloseGuard({ isResultStep, isPending, isUploading, hasChanges, onClose });

  async function handleSubmit() {
    goToStep(LOADING_STEP);
    setUploadProgress(0);

    startTransition(async () => {
      try {
        let currentFiles = portfolioFiles;
        const pendingFiles = portfolioFiles.filter((f) => !f.uploaded);

        if (pendingFiles.length > 0) {
          setIsUploading(true);
          currentFiles = await uploadFiles(portfolioFiles, pendingFiles.length);
          setPortfolioFiles(currentFiles);
          setIsUploading(false);

          const stillPending = currentFiles.filter((f) => !f.uploaded);
          if (stillPending.length > 0) {
            toast.error(
              "Some files could not be uploaded. Remove them or try again before closing.",
            );
            goToStep(4);
            return;
          }
        } else {
          setUploadProgress(80);
        }

        await closeCollaboration({
          collaborationId,
          creatorId,
          submissionName,
          overallRating: calculateCreatorRating([
            ...closedCollabRatings,
            {
              ratingVisualQuality: (ratings as CollaborationRatingsInput).visual_quality,
              ratingActingDelivery: (ratings as CollaborationRatingsInput).acting_line_delivery,
              ratingReliabilitySpeed: (ratings as CollaborationRatingsInput).reliability_speed,
            },
          ]),
          ratings: ratings as CollaborationRatingsInput,
          piecesOfContent: parseInt(piecesOfContent, 10),
          totalPaid: parseFloat(totalPaid),
          notes: notes || undefined,
        });

        setUploadProgress(100);
        goToStep(COMPLETE_STEP);
      } catch {
        toast.error("Failed to close collaboration. Please try again.");
        goToStep(4);
      }
    });
  }

  return (
    <>
      <Wizard variant="modal">
        <WizardPanel isPending={isPending && !isLoadingStep}>
          <WizardHeader>
            {!isResultStep ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRequestClose}
                disabled={isPending || isUploading}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            ) : (
              <span />
            )}
            <span />
          </WizardHeader>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <WizardStep stepKey={step} direction={directionRef.current}>
              {!isResultStep && (
                <div className="flex flex-col gap-2">
                  <WizardTitle>{CLOSE_WIZARD_STEPS[step].header}</WizardTitle>
                  <WizardDescription>{CLOSE_WIZARD_STEPS[step].body}</WizardDescription>
                </div>
              )}

              {step === 1 && (
                <StepRatings
                  ratings={ratings}
                  notes={notes}
                  onChange={setRatings}
                  onNotesChange={setNotes}
                />
              )}
              {step === 2 && (
                <StepRates
                  piecesOfContent={piecesOfContent}
                  totalPaid={totalPaid}
                  onPiecesChange={setPiecesOfContent}
                  onTotalPaidChange={setTotalPaid}
                />
              )}
              {step === 3 && (
                <StepPortfolio
                  files={portfolioFiles}
                  onFilesAdd={(files) =>
                    setPortfolioFiles((prev) => [
                      ...prev,
                      ...files.map((f) => ({ file: f, key: "", uploaded: false })),
                    ])
                  }
                  onFileRemove={(index) =>
                    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              )}
              {step === 4 && (
                <StepCloseConfirm
                  profilePhotoUrl={profilePhotoUrl}
                  creatorName={creatorName}
                  submissionName={submissionName}
                  ratings={ratings as CollaborationRatingsInput}
                  notes={notes}
                  piecesOfContent={piecesOfContent}
                  totalPaid={totalPaid}
                  portfolioFiles={portfolioFiles}
                  closedCollabRatings={closedCollabRatings}
                />
              )}
              {step === LOADING_STEP && (
                <WizardLoading
                  title="Closing collaboration"
                  description="Uploading portfolio files and finalizing — please don't close this page."
                  progress={uploadProgress}
                />
              )}
              {step === COMPLETE_STEP && (
                <WizardComplete
                  className="flex justify-center items-center"
                  title="Collaboration closed"
                  description="Ratings and rates have been recorded. The folder is now locked."
                >
                  <Button className="w-fit" type="button" onClick={handleDone}>
                    Done
                  </Button>
                </WizardComplete>
              )}

              {!isResultStep && (
                <WizardFooter>
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep(step - 1)}
                      disabled={isPending || isUploading}
                    >
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={() => goToStep(step + 1)}
                      disabled={!stepCanProceed || isUploading}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void handleSubmit()}
                      disabled={isPending || isUploading}
                    >
                      {isPending ? "Closing…" : "Close Collaboration"}
                    </Button>
                  )}
                </WizardFooter>
              )}
            </WizardStep>
          </div>
        </WizardPanel>

        <CreatorWizardAside
          creatorName={creatorName}
          profilePhotoUrl={profilePhotoUrl}
          subtitle={submissionName}
          visible={!isResultStep}
        />
      </Wizard>

      <AlertDialog open={confirmingClose} onOpenChange={onAlertOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard and close?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress won&apos;t be saved. The collaboration will remain open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={discardAndClose}>Discard and close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
