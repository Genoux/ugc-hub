"use client";

import { CheckIcon, X } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useFileUpload } from "@/features/uploads/hooks/use-file-upload";
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
import { editCollaboration } from "../actions/edit-collaboration";
import { logCollaboration } from "../actions/log-collaboration";
import { useWizardCloseGuard } from "../hooks/use-wizard-close-guard";
import { type CollaborationWizardMode, WIZARD_STEPS } from "../lib/collaboration-wizard-constants";
import {
  type CollaborationWizardState,
  canProceedStep,
  hasWizardChanges,
} from "../lib/collaboration-wizard-utils";
import type { CollaborationRatingsInput } from "../schemas";
import type { LogCollabInitialData } from "../types";
import { CreatorWizardAside } from "./creator-wizard-aside";
import { StepCloseConfirm } from "./steps/step-close-confirm";
import { StepLogConfirm } from "./steps/step-log-confirm";
import { StepLogDetails } from "./steps/step-log-details";
import { type PortfolioFile, StepPortfolio } from "./steps/step-portfolio";
import { StepRates } from "./steps/step-rates";
import { StepRatings } from "./steps/step-ratings";

const CONTENT_STEPS = Object.keys(WIZARD_STEPS.log).length;
const LOADING_STEP = CONTENT_STEPS + 1;
const COMPLETE_STEP = CONTENT_STEPS + 2;
const TOTAL_STEPS = COMPLETE_STEP;

export interface CollaborationWizardProps {
  mode: CollaborationWizardMode;
  onClose: () => void;
  onSuccess: () => void;
  creatorId: string;
  creatorName: string;
  profilePhotoUrl: string | null;
  closedCollabRatings: CollabRatingRow[];
  // close mode
  collaborationId?: string;
  submissionName?: string;
  // log mode (edit)
  initialData?: LogCollabInitialData;
}

export function CollaborationWizard({
  mode,
  onClose,
  onSuccess,
  creatorId,
  creatorName,
  profilePhotoUrl,
  closedCollabRatings,
  collaborationId,
  submissionName,
  initialData,
}: CollaborationWizardProps) {
  const isEdit = mode === "log" && initialData != null;
  const uploadSessionId = useMemo(() => crypto.randomUUID(), []);
  const sessionId = mode === "close" ? (collaborationId ?? "") : uploadSessionId;

  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [ratings, setRatings] = useState<Partial<CollaborationRatingsInput>>(
    () => initialData?.ratings ?? {},
  );
  const [piecesOfContent, setPiecesOfContent] = useState(() =>
    initialData ? String(initialData.piecesOfContent) : "",
  );
  const [totalPaid, setTotalPaid] = useState(() =>
    initialData ? String(initialData.totalPaidDollars) : "",
  );
  const [notes, setNotes] = useState(() => initialData?.notes ?? "");
  const [collabName, setCollabName] = useState(() => initialData?.name ?? "");
  const [existingHighlights, setExistingHighlights] = useState(() => initialData?.highlights ?? []);
  const [portfolioFiles, setPortfolioFiles] = useState<PortfolioFile[]>([]);
  const [isPending, startTransition] = useTransition();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Collects upload results in log mode — avoids stale state reads after upload()
  const uploadResultsRef = useRef<{ file: File; key: string }[]>([]);

  const showNameField = !isEdit || initialData?.projectId == null;

  const state: CollaborationWizardState = {
    ratings,
    piecesOfContent,
    totalPaid,
    notes,
    portfolioFiles,
    collabName,
    existingHighlights,
    showNameField,
  };

  const { upload, isUploading } = useFileUpload({
    presign: async (file) => {
      const res = await fetch("/api/uploads/portfolio/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorCollaborationId: sessionId,
          creatorId,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });
      if (!res.ok) throw new Error("Failed to get presigned URL");
      return res.json();
    },
    onComplete:
      mode === "close"
        ? async (file, result) => {
            const res = await fetch("/api/uploads/portfolio/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                collaborationId,
                key: result.key,
                filename: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
              }),
            });
            if (!res.ok) throw new Error("Failed to register upload");
          }
        : async (file, result) => {
            uploadResultsRef.current.push({ file, key: result.key });
          },
    onProgress: (p) => setUploadProgress(p * 0.8),
  });

  const isLoadingStep = step === LOADING_STEP;
  const isCompleteStep = step === COMPLETE_STEP;
  const isResultStep = isLoadingStep || isCompleteStep;

  const stepCanProceed = canProceedStep(mode, step, state);
  const allStepsValid = isEdit && [1, 2, 3].every((s) => canProceedStep("log", s, state));

  function handleDone() {
    onSuccess();
    onClose();
  }

  const { confirmingClose, handleRequestClose, onAlertOpenChange, discardAndClose } =
    useWizardCloseGuard({
      isResultStep,
      isPending,
      isUploading,
      hasChanges: () => hasWizardChanges(mode, state, initialData),
      onClose,
    });

  async function handleSubmit() {
    goToStep(LOADING_STEP);
    setUploadProgress(0);

    startTransition(async () => {
      try {
        const pendingFiles = portfolioFiles.filter((f) => !f.uploaded).map((f) => f.file);

        if (pendingFiles.length > 0) {
          uploadResultsRef.current = [];
          await upload(pendingFiles);

          if (mode === "log" && uploadResultsRef.current.length !== pendingFiles.length) {
            toast.error("Some files could not be uploaded. Remove them or try again.");
            goToStep(CONTENT_STEPS);
            return;
          }

          // Mark uploaded files in state to prevent re-upload on retry
          if (mode === "log") {
            setPortfolioFiles((prev) =>
              prev.map((pf) => {
                const result = uploadResultsRef.current.find((r) => r.file === pf.file);
                return result ? { ...pf, key: result.key, uploaded: true } : pf;
              }),
            );
          }
        } else {
          setUploadProgress(80);
        }

        const r = ratings as CollaborationRatingsInput;
        const overallRating = calculateCreatorRating([
          ...closedCollabRatings,
          {
            ratingVisualQuality: r.visual_quality,
            ratingActingDelivery: r.acting_line_delivery,
            ratingReliabilitySpeed: r.reliability_speed,
          },
        ]);

        if (mode === "log") {
          const newHighlights =
            uploadResultsRef.current.length > 0
              ? uploadResultsRef.current.map(({ file, key }) => ({
                  key,
                  filename: file.name,
                  mimeType: file.type,
                  sizeBytes: file.size,
                }))
              : undefined;

          if (isEdit && initialData) {
            await editCollaboration({
              collaborationId: initialData.collaborationId,
              creatorId,
              ...(initialData.projectId == null ? { name: collabName.trim() } : {}),
              overallRating,
              ratings: r,
              piecesOfContent: parseInt(piecesOfContent, 10),
              totalPaid: parseFloat(totalPaid),
              notes: notes || undefined,
              keepHighlightKeys: existingHighlights.map((h) => h.r2Key),
              newHighlights,
            });
          } else {
            await logCollaboration({
              creatorId,
              name: collabName.trim(),
              overallRating,
              ratings: r,
              piecesOfContent: parseInt(piecesOfContent, 10),
              totalPaid: parseFloat(totalPaid),
              notes: notes || undefined,
              highlights: newHighlights,
            });
          }
        } else {
          if (!collaborationId || !submissionName)
            throw new Error("Missing collaborationId or submissionName for close mode");
          await closeCollaboration({
            collaborationId,
            creatorId,
            submissionName,
            overallRating,
            ratings: r,
            piecesOfContent: parseInt(piecesOfContent, 10),
            totalPaid: parseFloat(totalPaid),
            notes: notes || undefined,
          });
        }

        setUploadProgress(100);
        goToStep(COMPLETE_STEP);
      } catch {
        const errorMsg =
          mode === "close"
            ? "Failed to close collaboration. Please try again."
            : isEdit
              ? "Failed to save changes."
              : "Failed to log collaboration. Please try again.";
        toast.error(errorMsg);
        goToStep(CONTENT_STEPS);
      }
    });
  }

  const asideSubtitle =
    mode === "close" ? (submissionName ?? "") : isEdit ? "Edit collaboration" : "Log collaboration";
  const loadingTitle =
    mode === "close"
      ? "Closing collaboration"
      : isEdit
        ? "Saving changes"
        : "Logging collaboration";
  const completeTitle =
    mode === "close"
      ? "Collaboration closed"
      : isEdit
        ? "Collaboration updated"
        : "Collaboration logged";
  const completeDescription =
    mode === "close"
      ? "Ratings and rates have been recorded. The folder is now locked."
      : isEdit
        ? "Changes are saved on this creator's profile."
        : "It now appears on this creator's profile.";
  const submitLabel =
    mode === "close"
      ? isPending
        ? "Closing…"
        : "Close Collaboration"
      : isPending
        ? "Saving…"
        : isEdit
          ? "Save changes"
          : "Log collaboration";

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
            {isEdit && !isResultStep ? (
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={() => void handleSubmit()}
                disabled={!allStepsValid || isPending || isUploading}
                aria-label="Save and close"
              >
                <CheckIcon className="size-5" />
              </Button>
            ) : (
              <span />
            )}
          </WizardHeader>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <WizardStep stepKey={step} direction={directionRef.current}>
              {!isResultStep && (
                <div className="flex flex-col gap-2">
                  <WizardTitle>{WIZARD_STEPS[mode][step].header}</WizardTitle>
                  <WizardDescription>{WIZARD_STEPS[mode][step].body}</WizardDescription>
                </div>
              )}

              {mode === "log" && step === 1 && (
                <StepLogDetails
                  collabName={collabName}
                  piecesOfContent={piecesOfContent}
                  totalPaid={totalPaid}
                  onNameChange={setCollabName}
                  onPiecesChange={setPiecesOfContent}
                  onTotalPaidChange={setTotalPaid}
                  showNameField={showNameField}
                />
              )}
              {mode === "log" && step === 2 && (
                <StepRatings
                  ratings={ratings}
                  notes={notes}
                  onChange={setRatings}
                  onNotesChange={setNotes}
                />
              )}
              {mode === "close" && step === 1 && (
                <StepRatings
                  ratings={ratings}
                  notes={notes}
                  onChange={setRatings}
                  onNotesChange={setNotes}
                />
              )}
              {mode === "close" && step === 2 && (
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
                  existingHighlights={isEdit ? existingHighlights : undefined}
                  onExistingRemove={
                    isEdit
                      ? (r2Key) =>
                          setExistingHighlights((prev) => prev.filter((h) => h.r2Key !== r2Key))
                      : undefined
                  }
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
              {mode === "log" && step === 4 && (
                <StepLogConfirm
                  profilePhotoUrl={profilePhotoUrl}
                  creatorName={creatorName}
                  collabName={collabName.trim()}
                  ratings={ratings as CollaborationRatingsInput}
                  notes={notes}
                  piecesOfContent={piecesOfContent}
                  totalPaid={totalPaid}
                  portfolioFiles={portfolioFiles}
                  closedCollabRatings={closedCollabRatings}
                  mode={isEdit ? "edit" : "log"}
                  portfolioFileTotalCount={existingHighlights.length + portfolioFiles.length}
                />
              )}
              {mode === "close" && step === 4 && (
                <StepCloseConfirm
                  profilePhotoUrl={profilePhotoUrl}
                  creatorName={creatorName}
                  submissionName={submissionName ?? ""}
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
                  title={loadingTitle}
                  description="Uploading files and saving — please don't close this page."
                  progress={uploadProgress}
                />
              )}
              {step === COMPLETE_STEP && (
                <WizardComplete
                  className="flex items-center justify-center"
                  title={completeTitle}
                  description={completeDescription}
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
                  {step < CONTENT_STEPS ? (
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
                      {submitLabel}
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
          subtitle={asideSubtitle}
          visible={!isResultStep}
        />
      </Wizard>

      <AlertDialog open={confirmingClose} onOpenChange={onAlertOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard and close?</AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "close"
                ? "Your progress won't be saved. The collaboration will remain open."
                : "Your progress won't be saved."}
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
