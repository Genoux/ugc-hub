"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import type { CollabRatingRow } from "@/shared/lib/calculate-ratings";
import { calculateCreatorRating } from "@/shared/lib/calculate-ratings";
import { logCollaboration } from "../actions/log-collaboration";
import { LOG_WIZARD_STEPS } from "../lib/log-wizard-constants";
import { canProceedLogWizard, hasLogWizardChanges } from "../lib/log-wizard-utils";
import type { CollaborationRatingsInput } from "../schemas";
import { StepLogConfirm } from "./steps/step-log-confirm";
import { StepLogDetails } from "./steps/step-log-details";
import { type PortfolioFile, StepPortfolio } from "./steps/step-portfolio";
import { StepRatings } from "./steps/step-ratings";

const CONTENT_STEPS = Object.keys(LOG_WIZARD_STEPS).length;
const LOADING_STEP = CONTENT_STEPS + 1;
const COMPLETE_STEP = CONTENT_STEPS + 2;
const TOTAL_STEPS = COMPLETE_STEP;

interface LogCollaborationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  creatorId: string;
  creatorName: string;
  profilePhotoUrl: string | null;
  profilePhotoBlurDataUrl?: string | null;
  closedCollabRatings: CollabRatingRow[];
}

export function LogCollaborationWizard({
  onClose,
  onSuccess,
  creatorId,
  creatorName,
  profilePhotoUrl,
  profilePhotoBlurDataUrl,
  closedCollabRatings,
}: LogCollaborationWizardProps) {
  const uploadSessionId = useMemo(() => crypto.randomUUID(), []);
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [collabName, setCollabName] = useState("");
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

  const stepCanProceed = canProceedLogWizard(step, collabName, piecesOfContent, totalPaid, ratings);

  const _filledSteps = new Set(
    Object.keys(LOG_WIZARD_STEPS)
      .map(Number)
      .filter(
        (s) => s >= step || canProceedLogWizard(s, collabName, piecesOfContent, totalPaid, ratings),
      ),
  );

  function resetState() {
    goToStep(1);
    setCollabName("");
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
    hasLogWizardChanges(collabName, piecesOfContent, totalPaid, notes, ratings, portfolioFiles);

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
              creatorCollaborationId: uploadSessionId,
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
    [creatorId, uploadSessionId],
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
            toast.error("Some files could not be uploaded. Remove them or try again.");
            goToStep(4);
            return;
          }
        } else {
          setUploadProgress(80);
        }

        const r = ratings as CollaborationRatingsInput;
        const highlights = currentFiles
          .filter((f) => f.uploaded && f.key)
          .map((f) => ({
            key: f.key,
            filename: f.file.name,
            mimeType: f.file.type,
            sizeBytes: f.file.size,
          }));

        await logCollaboration({
          creatorId,
          name: collabName.trim(),
          overallRating: calculateCreatorRating([
            ...closedCollabRatings,
            {
              ratingVisualQuality: r.visual_quality,
              ratingActingDelivery: r.acting_line_delivery,
              ratingReliabilitySpeed: r.reliability_speed,
            },
          ]),
          ratings: r,
          piecesOfContent: parseInt(piecesOfContent, 10),
          totalPaid: parseFloat(totalPaid),
          notes: notes || undefined,
          highlights: highlights.length > 0 ? highlights : undefined,
        });

        setUploadProgress(100);
        goToStep(COMPLETE_STEP);
      } catch {
        toast.error("Failed to log collaboration. Please try again.");
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
                />
              )}
              {step === LOADING_STEP && (
                <WizardLoading
                  title="Logging collaboration"
                  description="Uploading files and saving — please don't close this page."
                  progress={uploadProgress}
                />
              )}
              {step === COMPLETE_STEP && (
                <WizardComplete
                  className="flex items-center justify-center"
                  title="Collaboration logged"
                  description="It now appears on this creator's profile."
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
                      {isPending ? "Saving…" : "Log collaboration"}
                    </Button>
                  )}
                </WizardFooter>
              )}
            </WizardStep>
          </div>
        </WizardPanel>

        <WizardAside stepKey="creator" direction={1} visible={!isResultStep}>
          <div
            className={`relative flex h-full flex-col items-center justify-center gap-4 overflow-hidden p-8 ${profilePhotoUrl ? "" : "bg-gradient-to-br from-slate-700 to-slate-900"}`}
          >
            <div className="absolute inset-0 z-10 bg-black/30" />
            <div className="absolute inset-0 z-10 backdrop-blur-md" />
            {profilePhotoUrl && (
              <Image
                src={profilePhotoUrl}
                alt=""
                fill
                unoptimized
                placeholder={profilePhotoBlurDataUrl ? "blur" : "empty"}
                blurDataURL={profilePhotoBlurDataUrl ?? undefined}
                className="object-cover"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {profilePhotoUrl ? (
                <Image
                  src={profilePhotoUrl}
                  alt={creatorName}
                  width={80}
                  height={80}
                  unoptimized
                  placeholder={profilePhotoBlurDataUrl ? "blur" : "empty"}
                  blurDataURL={profilePhotoBlurDataUrl ?? undefined}
                  className="size-40 rounded-full object-cover shadow-hub"
                />
              ) : (
                <div className="flex size-40 items-center justify-center rounded-full bg-white/20 text-3xl font-semibold text-white shadow-hub">
                  {creatorName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-semibold text-white">{creatorName}</p>
                <p className="text-md mt-0.5 text-white/80">Log collaboration</p>
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
            <AlertDialogDescription>Your progress won&apos;t be saved.</AlertDialogDescription>
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
