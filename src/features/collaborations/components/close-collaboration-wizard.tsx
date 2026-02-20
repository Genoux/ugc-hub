"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { closeCollaboration } from "../actions/close-collaboration";
import { calculateOverallRating } from "../lib/calculate-overall-rating";
import type { CollaborationRatingsInput } from "../schemas";
import { StepCloseConfirm } from "./steps/step-close-confirm";
import { StepPortfolio, type PortfolioFile } from "./steps/step-portfolio";
import { StepRates } from "./steps/step-rates";
import { StepRatings } from "./steps/step-ratings";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Ratings",
  2: "Rates",
  3: "Portfolio",
  4: "Confirm & Close",
};

interface CloseCollaborationWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folderId: string;
  creatorId: string;
  creatorName: string;
  submissionName: string;
}

export function CloseCollaborationWizard({
  open,
  onClose,
  onSuccess,
  folderId,
  creatorId,
  creatorName,
  submissionName,
}: CloseCollaborationWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [ratings, setRatings] = useState<Partial<CollaborationRatingsInput>>({});
  const [piecesOfContent, setPiecesOfContent] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<PortfolioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const ratingsComplete =
    ratings.visual_quality && ratings.acting_line_delivery && ratings.reliability_speed;

  const canContinue =
    step === 1
      ? !!ratingsComplete
      : step === 2
        ? parseInt(piecesOfContent, 10) > 0 && parseFloat(totalPaid) >= 0
        : true;

  function handleClose() {
    setStep(1);
    setRatings({});
    setPiecesOfContent("");
    setTotalPaid("");
    setNotes("");
    setPortfolioFiles([]);
    onClose();
  }

  const uploadPortfolioFiles = useCallback(
    async (files: PortfolioFile[]) => {
      const pending = files.filter((f) => !f.uploaded);
      if (pending.length === 0) return files;

      setIsUploading(true);
      const updated = [...files];

      for (const pf of pending) {
        try {
          const res = await fetch("/api/uploads/portfolio/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creatorFolderId: folderId,
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
              creatorFolderId: folderId,
              creatorId,
              key,
              filename: pf.file.name,
              mimeType: pf.file.type,
              sizeBytes: pf.file.size,
            }),
          });
          if (!completeRes.ok) throw new Error("Failed to register upload");

          const idx = updated.findIndex((f) => f === pf);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], key, uploaded: true };
          }
        } catch {
          toast.error(`Failed to upload ${pf.file.name}`);
        }
      }

      setIsUploading(false);
      return updated;
    },
    [folderId, creatorId],
  );

  function handleNext() {
    setStep((step + 1) as Step);
  }

  async function handleSubmit() {
    startTransition(async () => {
      try {
        const toUpload = portfolioFiles.filter((f) => !f.uploaded);
        if (toUpload.length > 0) {
          setIsUploading(true);
          const uploaded = await uploadPortfolioFiles(portfolioFiles);
          setPortfolioFiles(uploaded);
          setIsUploading(false);
        }
        await closeCollaboration({
          folderId,
          creatorId,
          submissionName,
          overallRating: calculateOverallRating(ratings as CollaborationRatingsInput),
          ratings: ratings as CollaborationRatingsInput,
          piecesOfContent: parseInt(piecesOfContent, 10),
          totalPaid: parseFloat(totalPaid),
          notes: notes || undefined,
        });
        toast.success("Collaboration closed");
        handleClose();
        onSuccess();
      } catch {
        toast.error("Failed to close collaboration. Please try again.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isPending && !isUploading) handleClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <p className="text-xs text-muted-foreground font-medium">
            {creatorName} &middot; {submissionName}
          </p>
          <DialogTitle>Close collaboration</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (s < step && !isUploading) setStep(s);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  s === step
                    ? "text-foreground"
                    : s < step
                      ? "text-primary cursor-pointer hover:underline"
                      : "text-muted-foreground"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    s === step
                      ? "bg-foreground text-background border-foreground"
                      : s < step
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
                {STEP_LABELS[s]}
              </button>
              {s < 4 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="py-1">
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
              creatorName={creatorName}
              submissionName={submissionName}
              ratings={ratings as CollaborationRatingsInput}
              portfolioFiles={portfolioFiles}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((step - 1) as Step)}
                disabled={isPending || isUploading}
                className="gap-1.5 text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending || isUploading}
            >
              Cancel
            </Button>
            {step < 4 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canContinue || isUploading}
                className="gap-1.5"
              >
                {isUploading ? "Uploading…" : "Continue"}
                {!isUploading && <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => void handleSubmit()}
                disabled={isPending || isUploading}
              >
                {isUploading ? "Uploading…" : isPending ? "Closing…" : "Close Collaboration"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
