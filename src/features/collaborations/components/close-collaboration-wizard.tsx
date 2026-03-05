"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { ProgressDots } from "@/shared/components/wizard/progress-dots";
import {
  Wizard,
  WizardAside,
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
import type { CollabRatingRow } from "../../../shared/lib/calculate-ratings";
import { calculateCreatorRating } from "../../../shared/lib/calculate-ratings";
import { closeCollaboration } from "../actions/close-collaboration";
import { CLOSE_WIZARD_STEPS } from "../lib/close-wizard-constants";
import { canProceed } from "../lib/close-wizard-utils";
import type { CollaborationRatingsInput } from "../schemas";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const pendingCloseActionRef = useRef<(() => void) | null>(null);

  const isLoadingStep = step === LOADING_STEP;
  const isCompleteStep = step === COMPLETE_STEP;
  const isResultStep = isLoadingStep || isCompleteStep;

  const stepCanProceed = canProceed(step, ratings, piecesOfContent, totalPaid, portfolioFiles);

  const filledSteps = new Set(
    Object.keys(CLOSE_WIZARD_STEPS)
      .map(Number)
      .filter(
        (s) => s >= step || canProceed(s, ratings, piecesOfContent, totalPaid, portfolioFiles),
      ),
  );

  function resetState() {
    goToStep(1);
    setRatings({});
    setPiecesOfContent("");
    setTotalPaid("");
    setNotes("");
    setPortfolioFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

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

  const handleRequestClose = () => {
    if (isResultStep) {
      handleClose();
      return;
    }
    if (!hasChanges()) {
      handleClose();
      return;
    }
    setConfirmingClose(true);
  };

  const runAfterAlertClosed = (action: () => void) => {
    pendingCloseActionRef.current = action;
    setConfirmingClose(false);
  };

  // Stable ref so the effect doesn't need handleRequestClose in its deps
  const handleRequestCloseRef = useRef(handleRequestClose);
  handleRequestCloseRef.current = handleRequestClose;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending && !isUploading) {
        handleRequestCloseRef.current();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, isUploading]);

  const uploadPortfolioFiles = useCallback(
    async (files: PortfolioFile[], totalFiles: number) => {
      const pending = files.filter((f) => !f.uploaded);
      if (pending.length === 0) return files;

      const progressPerFile = totalFiles > 0 ? 80 / totalFiles : 80;
      const updated = [...files];

      for (const pf of pending) {
        try {
          const res = await fetch("/api/uploads/portfolio/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creatorCollaborationId: collaborationId,
              creatorId,
              filename: pf.file.name,
              mimeType: pf.file.type,
              fileSize: pf.file.size,
            }),
          });

          if (!res.ok) throw new Error("Failed to get presigned URL");
          const { uploadUrl, key } = await res.json();

          const putRes = await fetch(uploadUrl, {
            method: "PUT",
            body: pf.file,
            headers: { "Content-Type": pf.file.type },
          });
          if (!putRes.ok) throw new Error("Upload failed");

          const completeRes = await fetch("/api/uploads/portfolio/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collaborationId,
              key,
              filename: pf.file.name,
              mimeType: pf.file.type,
              sizeBytes: pf.file.size,
            }),
          });
          if (!completeRes.ok) throw new Error("Failed to register upload");

          const idx = updated.indexOf(pf);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], key, uploaded: true };
          }
        } catch {
          toast.error(`Failed to upload ${pf.file.name}`);
        }

        setUploadProgress((prev) => Math.min(prev + progressPerFile, 80));
      }

      return updated;
    },
    [collaborationId, creatorId],
  );

  async function handleSubmit() {
    goToStep(LOADING_STEP);
    setUploadProgress(0);

    startTransition(async () => {
      try {
        let currentFiles = portfolioFiles;
        const pendingFiles = portfolioFiles.filter((f) => !f.uploaded);

        if (pendingFiles.length > 0) {
          setIsUploading(true);
          currentFiles = await uploadPortfolioFiles(portfolioFiles, pendingFiles.length);
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
                  creatorName={creatorName}
                  files={portfolioFiles}
                  isUploading={isUploading}
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
                  title="Collaboration closed"
                  description="Ratings and rates have been recorded. The folder is now locked."
                >
                  <Button type="button" onClick={handleDone}>
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

        {/* Static stepKey — content is the same for all form steps */}
        <WizardAside stepKey="creator" direction={1} visible={!isResultStep}>
          <div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-hidden p-8">
            <div className="absolute inset-0 backdrop-blur-md z-10" />
            <Image src={profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Image
                src={profilePhotoUrl}
                alt={creatorName}
                width={80}
                height={80}
                unoptimized
                className="size-40 rounded-full object-cover shadow-hub"
              />
              <div className="text-center">
                <p className="text-2xl font-semibold text-white">{creatorName}</p>
                <p className="text-md text-white/80 mt-0.5">{submissionName}</p>
              </div>
            </div>
          </div>
        </WizardAside>
      </Wizard>

      <AlertDialog
        open={confirmingClose}
        onOpenChange={(open) => {
          setConfirmingClose(open);
          if (!open) {
            const action = pendingCloseActionRef.current;
            pendingCloseActionRef.current = null;
            setTimeout(() => action?.(), 250);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard and close?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress won&apos;t be saved. The collaboration will remain open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmingClose(false)}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => runAfterAlertClosed(handleClose)}>
              Discard and close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
