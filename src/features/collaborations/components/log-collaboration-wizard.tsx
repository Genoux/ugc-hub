"use client";

import { CheckIcon, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
import { editCollaboration } from "../actions/edit-collaboration";
import { logCollaboration } from "../actions/log-collaboration";
import { usePortfolioUpload } from "../hooks/use-portfolio-upload";
import { useWizardCloseGuard } from "../hooks/use-wizard-close-guard";
import { LOG_WIZARD_STEPS } from "../lib/log-wizard-constants";
import { canProceedLogWizard, hasLogWizardChanges } from "../lib/log-wizard-utils";
import type { CollaborationRatingsInput } from "../schemas";
import { CreatorWizardAside } from "./creator-wizard-aside";
import { StepLogConfirm } from "./steps/step-log-confirm";
import { StepLogDetails } from "./steps/step-log-details";
import { type PortfolioFile, StepPortfolio } from "./steps/step-portfolio";
import { StepRatings } from "./steps/step-ratings";

const CONTENT_STEPS = Object.keys(LOG_WIZARD_STEPS).length;
const LOADING_STEP = CONTENT_STEPS + 1;
const COMPLETE_STEP = CONTENT_STEPS + 2;
const TOTAL_STEPS = COMPLETE_STEP;

export type LogCollabInitialData = {
  collaborationId: string;
  name: string;
  projectId: string | null;
  ratings: CollaborationRatingsInput;
  piecesOfContent: number;
  totalPaidDollars: number;
  notes: string | null;
  highlights: { id: string; r2Key: string; filename: string; url: string }[];
};

interface LogCollaborationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  creatorId: string;
  creatorName: string;
  profilePhotoUrl: string | null;
  profilePhotoBlurDataUrl?: string | null;
  closedCollabRatings: CollabRatingRow[];
  initialData?: LogCollabInitialData;
}

export function LogCollaborationWizard({
  onClose,
  onSuccess,
  creatorId,
  creatorName,
  profilePhotoUrl,
  profilePhotoBlurDataUrl,
  closedCollabRatings,
  initialData,
}: LogCollaborationWizardProps) {
  const isEdit = initialData != null;
  const uploadSessionId = useMemo(() => crypto.randomUUID(), []);
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [collabName, setCollabName] = useState(() => initialData?.name ?? "");
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
  const [existingHighlights, setExistingHighlights] = useState(() => initialData?.highlights ?? []);
  const [portfolioFiles, setPortfolioFiles] = useState<PortfolioFile[]>([]);
  const [isPending, startTransition] = useTransition();

  const { uploadProgress, setUploadProgress, isUploading, setIsUploading, uploadFiles } =
    usePortfolioUpload({ creatorId, sessionId: uploadSessionId });

  const isLoadingStep = step === LOADING_STEP;
  const isCompleteStep = step === COMPLETE_STEP;
  const isResultStep = isLoadingStep || isCompleteStep;

  const showNameField = !isEdit || initialData?.projectId == null;
  const totalHighlights = existingHighlights.length + portfolioFiles.length;
  const stepCanProceed = canProceedLogWizard(
    step,
    collabName,
    piecesOfContent,
    totalPaid,
    ratings,
    showNameField,
    totalHighlights,
  );
  const allStepsValid =
    isEdit &&
    [1, 2, 3].every((s) =>
      canProceedLogWizard(
        s,
        collabName,
        piecesOfContent,
        totalPaid,
        ratings,
        showNameField,
        totalHighlights,
      ),
    );

  function handleDone() {
    onSuccess();
    onClose();
  }

  const hasChanges = () => {
    if (!isEdit) {
      return hasLogWizardChanges(
        collabName,
        piecesOfContent,
        totalPaid,
        notes,
        ratings,
        portfolioFiles,
      );
    }
    const init = initialData;
    const r = ratings as CollaborationRatingsInput;
    return (
      (showNameField && collabName !== init.name) ||
      piecesOfContent !== String(init.piecesOfContent) ||
      totalPaid !== String(init.totalPaidDollars) ||
      notes !== (init.notes ?? "") ||
      r.visual_quality !== init.ratings.visual_quality ||
      r.acting_line_delivery !== init.ratings.acting_line_delivery ||
      r.reliability_speed !== init.ratings.reliability_speed ||
      existingHighlights.length !== init.highlights.length ||
      portfolioFiles.length > 0
    );
  };

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
            toast.error("Some files could not be uploaded. Remove them or try again.");
            goToStep(4);
            return;
          }
        } else {
          setUploadProgress(80);
        }

        const r = ratings as CollaborationRatingsInput;
        const newHighlights = currentFiles
          .filter((f) => f.uploaded && f.key)
          .map((f) => ({
            key: f.key,
            filename: f.file.name,
            mimeType: f.file.type,
            sizeBytes: f.file.size,
          }));

        const overallRating = calculateCreatorRating([
          ...closedCollabRatings,
          {
            ratingVisualQuality: r.visual_quality,
            ratingActingDelivery: r.acting_line_delivery,
            ratingReliabilitySpeed: r.reliability_speed,
          },
        ]);

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
            newHighlights: newHighlights.length > 0 ? newHighlights : undefined,
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
            highlights: newHighlights.length > 0 ? newHighlights : undefined,
          });
        }

        setUploadProgress(100);
        goToStep(COMPLETE_STEP);
      } catch {
        toast.error(
          isEdit ? "Failed to save changes." : "Failed to log collaboration. Please try again.",
        );
        goToStep(4);
      }
    });
  }

  const asideSubtitle = isEdit ? "Edit collaboration" : "Log collaboration";
  const loadingTitle = isEdit ? "Saving changes" : "Logging collaboration";
  const completeTitle = isEdit ? "Collaboration updated" : "Collaboration logged";
  const completeDescription = isEdit
    ? "Changes are saved on this creator's profile."
    : "It now appears on this creator's profile.";
  const submitLabel = isPending ? "Saving…" : isEdit ? "Save changes" : "Log collaboration";

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
                  <WizardTitle>{LOG_WIZARD_STEPS[step].header}</WizardTitle>
                  <WizardDescription>{LOG_WIZARD_STEPS[step].body}</WizardDescription>
                </div>
              )}

              {step === 1 && (
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
              {step === 2 && (
                <StepRatings
                  ratings={ratings}
                  notes={notes}
                  onChange={setRatings}
                  onNotesChange={setNotes}
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
              {step === 4 && (
                <StepLogConfirm
                  profilePhotoUrl={profilePhotoUrl}
                  profilePhotoBlurDataUrl={profilePhotoBlurDataUrl}
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
          profilePhotoBlurDataUrl={profilePhotoBlurDataUrl}
          subtitle={asideSubtitle}
          visible={!isResultStep}
        />
      </Wizard>

      <AlertDialog open={confirmingClose} onOpenChange={onAlertOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard and close?</AlertDialogTitle>
            <AlertDialogDescription>Your progress won&apos;t be saved.</AlertDialogDescription>
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
