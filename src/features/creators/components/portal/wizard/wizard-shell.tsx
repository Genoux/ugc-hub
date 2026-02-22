"use client";

import { useState, useTransition } from "react";
import { completeCreatorProfile } from "@/features/creators/actions/portal/complete-creator-profile";
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
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Step1BasicInfo } from "./steps/step-1-basic-info";
import { Step2Socials } from "./steps/step-2-socials";
import { Step3Categories } from "./steps/step-3-categories";
import { Step4Formats } from "./steps/step-4-formats";
import { Step5Photo } from "./steps/step-5-photo";
import { Step6Videos } from "./steps/step-6-videos";
import { Step7Rates } from "./steps/step-7-rates";
import { Step8Demographics } from "./steps/step-8-demographics";
import { Step9Complete } from "./steps/step-9-complete";
import { STEP_TIPS, STEP_TITLES } from "./wizard-constants";
import {
  type PortfolioVideoManager,
  usePortfolioVideoManager,
} from "@/features/creators/hooks/use-portfolio-video-manager";
import {
  type ProfilePhotoManager,
  useProfilePhotoManager,
} from "@/features/creators/hooks/use-profile-photo-manager";
import {
  canProceed,
  INITIAL_WIZARD_DATA,
  type ProfileWizardProps,
  type WizardData,
} from "./wizard-types";

const TOTAL_STEPS = 9;

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={`progress-dot-${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            i + 1 < current
              ? "w-3 bg-foreground"
              : i + 1 === current
                ? "w-4 bg-foreground"
                : "w-1.5 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

interface StepContentProps {
  step: number;
  data: WizardData;
  onChange: (u: Partial<WizardData>) => void;
  creatorId: string;
  photoManager: ProfilePhotoManager;
  videoManager: PortfolioVideoManager;
}

function StepContent({ step, data, onChange, creatorId, photoManager, videoManager }: StepContentProps) {
  switch (step) {
    case 1:
      return <Step1BasicInfo data={data} onChange={onChange} />;
    case 2:
      return <Step2Socials data={data} onChange={onChange} />;
    case 3:
      return <Step3Categories data={data} onChange={onChange} />;
    case 4:
      return <Step4Formats data={data} onChange={onChange} />;
    case 5:
      return (
        <Step5Photo
          photoKey={data.profilePhoto}
          photoManager={photoManager}
          onChange={(key) => onChange({ profilePhoto: key })}
          creatorId={creatorId}
        />
      );
    case 6:
      return (
        <Step6Videos
          doneEntries={videoManager.doneEntries}
          uploadingEntries={videoManager.uploadingEntries}
          onEntryAdd={videoManager.add}
          onEntryRemove={videoManager.remove}
          onUploadStart={videoManager.uploadStart}
          onUploadEnd={videoManager.uploadEnd}
          creatorId={creatorId}
        />
      );
    case 7:
      return <Step7Rates data={data} onChange={onChange} />;
    case 8:
      return <Step8Demographics data={data} onChange={onChange} />;
    case 9:
      return <Step9Complete />;
    default:
      return null;
  }
}

export function WizardShell({ creator, initialData, onComplete, onClose }: ProfileWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({ ...INITIAL_WIZARD_DATA, ...initialData });
  const [isPending, startTransition] = useTransition();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const photoManager = useProfilePhotoManager();
  const videoManager = usePortfolioVideoManager();

  const update = (updates: Partial<WizardData>) => setData((prev) => ({ ...prev, ...updates }));
  const isLast = step === TOTAL_STEPS;

  const handleStepChange = (next: number) => setStep(next);

  const handleRequestClose = () => {
    if (isLast) {
      onClose();
      return;
    }
  setConfirmingClose(true);
  };

  const handleConfirmedClose = () => {
    videoManager.abandonAll();
    onClose();
  };

  const handleSubmit = () => {
    startTransition(async () => {
      await completeCreatorProfile({
        creatorId: creator.id,
        fullName: data.fullName,
        country: data.country,
        languages: data.languages,
        socialChannels: {
          instagram_handle: data.instagramHandle || undefined,
          tiktok_handle: data.tiktokHandle || undefined,
          youtube_handle: data.youtubeHandle || undefined,
        },
        portfolioUrl: data.portfolioUrl || undefined,
        ugcCategories: data.ugcCategories,
        contentFormats: data.contentFormats,
        profilePhoto: data.profilePhoto || undefined,
        rateRangeSelf: data.rateRangeSelf ?? undefined,
        genderIdentity: data.genderIdentity || undefined,
        ageDemographic: data.ageDemographic || undefined,
        ethnicity: data.ethnicity || undefined,
      });
      onComplete();
    });
  };

  const handleNext = () => {
    if (isLast) handleSubmit();
    else handleStepChange(step + 1);
  };

  const tip = STEP_TIPS[step];
  const stepCanProceed = canProceed(step, data, videoManager.completedCount);

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) handleRequestClose();
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">
                Step {step} of {TOTAL_STEPS}
              </p>
              <h2 className="text-base font-semibold">{STEP_TITLES[step]}</h2>
            </div>
            <ProgressDots current={step} total={TOTAL_STEPS} />
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <StepContent
                step={step}
                data={data}
                onChange={update}
                creatorId={creator.id}
                photoManager={photoManager}
                videoManager={videoManager}
              />
            </div>

            {/* Tip panel — desktop only */}
            {tip && (
              <aside className="hidden w-52 shrink-0 border-l bg-muted/30 px-5 py-5 lg:block">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Pro tip
                </p>
                <p className="mt-2 text-sm font-medium">{tip.heading}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{tip.body}</p>
              </aside>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleStepChange(step - 1)}
                disabled={isPending}
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!stepCanProceed || isPending || (step === 5 && photoManager.isUploading) || (step === 6 && videoManager.isUploading)}
            >
              {isPending ? "Saving…" : isLast ? "Complete" : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmingClose} onOpenChange={setConfirmingClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit profile setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress won't be saved. You can come back and complete your profile anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedClose}>Quit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
