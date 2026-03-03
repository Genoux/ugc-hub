"use client";

import { CheckIcon, CircleAlert, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { completeCreatorProfile } from "@/features/creators/actions/portal/complete-creator-profile";
import {
  type PortfolioVideoManager,
  usePortfolioVideoManager,
} from "@/features/creators/hooks/portal/use-portfolio-video-manager";
import {
  type ProfilePhotoManager,
  useProfilePhotoManager,
} from "@/features/creators/hooks/portal/use-profile-photo-manager";
import {
  buildOnboardingData,
  canProceed,
} from "@/features/creators/lib/onboarding-utils";
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
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import { cn } from "@/shared/lib/utils";
import { STEPS } from "./onboarding-constants";
import type { OnboardingData, OnboardingProps } from "./onboarding-types";
import { StepAboutYou } from "./steps/step-about-you";
import { StepComplete } from "./steps/step-complete";
import { StepName } from "./steps/step-name";
import { StepNiche } from "./steps/step-niche";
import { StepPhoto } from "./steps/step-photo";
import { StepRates } from "./steps/step-rates";
import { StepSocials } from "./steps/step-socials";
import { StepStyle } from "./steps/step-style";
import { StepVideos } from "./steps/step-videos";

const TOTAL_STEPS = 9;

function ProgressDots({
  current,
  steps,
  onStepClick,
  filledSteps,
}: {
  current: number;
  steps: Record<number, { name: string }>;
  filledSteps: Set<number>;
  onStepClick: (step: number) => void;
}) {
  const stepEntries = Object.entries(steps).map(([key, val]) => ({
    step: Number(key),
    name: val.name,
  }));

  return (
    <div
      className="flex items-center gap-1 flex-wrap justify-center"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={stepEntries.length}
      aria-label={steps[current]?.name}
    >
      {stepEntries.map(({ step, name }) => {
        const isCompleted = step < current;
        const isCurrent = step === current;
        return (
          <Button
            key={step}
            variant="outline"
            size="sm"
            onClick={() => onStepClick(step)}
            className={cn(
              `text-xs transition-colors disabled:cursor-default relative`,
              isCompleted && "text-foreground",
              isCurrent && "text-foreground font-medium opacity-100",
            )}
            aria-label={isCompleted ? `Go back to ${name}` : name}
          >
            {!filledSteps.has(step)
              ? (
                <CircleAlert className="size-3.5 rounded-full animate-pulse text-red-500 bg-white absolute -top-1 -right-1" />
              )
              : null}
            <span className={cn(!isCurrent && "opacity-50")}>{name}</span>
          </Button>
        );
      })}
    </div>
  );
}

interface StepContentProps {
  step: number;
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
  creatorId: string;
  photoManager: ProfilePhotoManager;
  videoManager: PortfolioVideoManager;
  submitError: string | null;
  onExitResult: () => void;
  onRetryResult: () => void;
}

function StepContent({
  step,
  data,
  onChange,
  creatorId,
  photoManager,
  videoManager,
  submitError,
  onExitResult,
  onRetryResult,
}: StepContentProps) {
  switch (step) {
    case 1:
      return <StepName data={data} onChange={onChange} />;
    case 2:
      return <StepSocials data={data} onChange={onChange} />;
    case 3:
      return <StepNiche data={data} onChange={onChange} />;
    case 4:
      return <StepStyle data={data} onChange={onChange} />;
    case 5:
      return (
        <StepPhoto
          photoKey={data.profilePhoto}
          photoManager={photoManager}
          onChange={(key) => onChange({ profilePhoto: key })}
          creatorId={creatorId}
        />
      );
    case 6:
      return (
        <StepVideos
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
      return <StepRates data={data} onChange={onChange} />;
    case 8:
      return <StepAboutYou data={data} onChange={onChange} />;
    case 9:
      return (
        <StepComplete
          error={submitError}
          onExit={onExitResult}
          onRetry={onRetryResult}
        />
      );
    default:
      return null;
  }
}

export function OnboardingShell(
  { creator, onComplete, onClose }: OnboardingProps,
) {
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [data, setData] = useState<OnboardingData>(() =>
    buildOnboardingData(creator)
  );
  const [isPending, startTransition] = useTransition();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const initialData = useRef(buildOnboardingData(creator));
  const initialVideoIds = useRef(
    new Set(creator.portfolioVideos.map((v) => v.id)),
  );
  const photoManager = useProfilePhotoManager(creator.profilePhotoUrl);
  const videoManager = usePortfolioVideoManager(
    creator.portfolioVideos.map((v) => ({
      assetId: v.id,
      key: v.url,
      filename: v.filename,
      objectUrl: v.url,
    })),
  );

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState<
    "incomplete" | "leave_save" | "quit" | null
  >(null);
  const update = (updates: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...updates }));
  const isLastFormStep = step === 8;
  const isResultStep = step === TOTAL_STEPS;
  const pendingCloseActionRef = useRef<(() => void | Promise<void>) | null>(
    null,
  );

  const ALERT_CLOSE_MS = 250;

  const handleStepChange = (next: number) => {
    setSubmitError(null);
    goToStep(next);
  };

  const hasChanges = () => {
    if (JSON.stringify(data) !== JSON.stringify(initialData.current)) {
      return true;
    }
    const currentIds = videoManager.doneEntries.map((e) => e.assetId);
    if (currentIds.length !== initialVideoIds.current.size) return true;
    return currentIds.some((id) => !initialVideoIds.current.has(id));
  };

  const handleRequestClose = () => {
    if (isResultStep) {
      onClose();
      return;
    }
    if (creator.profileCompleted && !hasChanges()) {
      onClose();
      return;
    }
    const allComplete = [1, 2, 3, 4, 5, 6, 7, 8].every((s) =>
      canProceed(s, data, videoManager.completedCount)
    );
    if (hasChanges() && !allComplete) {
      setCloseReason("incomplete");
    } else if (creator.profileCompleted) {
      setCloseReason("leave_save");
    } else {
      setCloseReason("quit");
    }
    setConfirmingClose(true);
  };

  const runAfterAlertClosed = (action: () => void | Promise<void>) => {
    pendingCloseActionRef.current = action;
    setConfirmingClose(false);
  };

  const handleConfirmedClose = () => {
    runAfterAlertClosed(async () => {
      await videoManager.abandonAll();
      onClose();
    });
  };

  const handleRevertAndQuit = () => {
    runAfterAlertClosed(async () => {
      setData(initialData.current);
      await videoManager.abandonAll();
      onClose();
    });
  };

  const buildProfilePayload = () => ({
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
    profilePhoto: data.profilePhoto,
    rateRangeSelf: data.rateRangeSelf ?? undefined,
    genderIdentity: data.genderIdentity || undefined,
    ageDemographic: data.ageDemographic || undefined,
    ethnicity: data.ethnicity || undefined,
  });

  const handleSaveAndClose = () => {
    startTransition(async () => {
      try {
        await completeCreatorProfile(buildProfilePayload());
        onClose();
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
        setConfirmingClose(false);
      }
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setSubmitError(null);
      try {
        await completeCreatorProfile(buildProfilePayload());
        if (creator.profileCompleted) {
          onClose();
        } else {
          goToStep(9);
        }
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
        goToStep(9);
      }
    });
  };

  const handleNext = () => {
    if (isLastFormStep) handleSubmit();
    else handleStepChange(step + 1);
  };

  const handleExitResult = () => {
    onComplete();
  };

  const videoCount = videoManager.completedCount;
  const stepCanProceed = canProceed(step, data, videoCount);
  const allStepsComplete = [1, 2, 3, 4, 5, 6, 7, 8].every((s) =>
    canProceed(s, data, videoCount)
  );
  const filledSteps = new Set(
    Object.keys(STEPS)
      .map(Number)
      .filter((s) => canProceed(s, data, videoCount)),
  );

  return (
    <>
      <Wizard variant="modal">
        <WizardPanel isPending={isPending}>
          <WizardHeader>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRequestClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
            {creator.profileCompleted && !isResultStep
              ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveAndClose}
                  disabled={!allStepsComplete ||
                    isPending ||
                    (step === 5 && photoManager.isUploading) ||
                    (step === 6 && videoManager.isUploading)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Save and close"
                >
                  <CheckIcon className="size-5" />
                </Button>
              )
              : <span />}
          </WizardHeader>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <WizardStep stepKey={step} direction={directionRef.current}>
              {!isResultStep && (
                <div className="flex flex-col gap-2">
                  <WizardTitle>{STEPS[step].header}</WizardTitle>
                  <WizardDescription>{STEPS[step].body}</WizardDescription>
                </div>
              )}
              <StepContent
                step={step}
                data={data}
                onChange={update}
                creatorId={creator.id}
                photoManager={photoManager}
                videoManager={videoManager}
                submitError={submitError}
                onExitResult={handleExitResult}
                onRetryResult={() => handleStepChange(8)}
              />
              {!isResultStep && (
                <WizardFooter>
                  {step > 1
                    ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleStepChange(step - 1)}
                        disabled={isPending}
                      >
                        Back
                      </Button>
                    )
                    : <span />}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!stepCanProceed ||
                      isPending ||
                      (step === 5 && photoManager.isUploading) ||
                      (step === 6 && videoManager.isUploading)}
                  >
                    {isPending
                      ? "Saving…"
                      : isLastFormStep
                      ? creator.profileCompleted ? "Save" : "Complete"
                      : "Next"}
                  </Button>
                </WizardFooter>
              )}
            </WizardStep>

            {!isResultStep && creator.profileCompleted && (
              <div className="w-full flex justify-center pb-21">
                <ProgressDots
                  filledSteps={filledSteps}
                  current={step}
                  steps={STEPS}
                  onStepClick={handleStepChange}
                />
              </div>
            )}
          </div>
        </WizardPanel>

        <WizardAside
          stepKey={step}
          direction={directionRef.current}
          visible={!isResultStep}
        >
          <Image
            src={`/creator/onboarding/step${step}.jpg`}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </WizardAside>
      </Wizard>

      <AlertDialog
        open={confirmingClose}
        onOpenChange={(open) => {
          setConfirmingClose(open);
          if (!open) {
            const action = pendingCloseActionRef.current;
            pendingCloseActionRef.current = null;
            setTimeout(async () => {
              await action?.();
              setCloseReason(null);
            }, ALERT_CLOSE_MS);
          }
        }}
      >
        <AlertDialogContent>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmingClose(false)}
            className="absolute right-2 top-2 text-muted-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {closeReason === "incomplete"
                ? "Profile incomplete"
                : creator.profileCompleted
                ? "Leave profile setup?"
                : "Quit profile setup?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {closeReason === "incomplete"
                ? "Please make sure to fill out all the steps before leaving, or discard your changes."
                : creator.profileCompleted
                ? "Do you want to save your changes before leaving?"
                : "Your progress won't be saved. You can come back and complete your profile anytime."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {closeReason === "incomplete"
              ? (
                <>
                  <AlertDialogCancel onClick={() => setConfirmingClose(false)}>
                    Stay
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevertAndQuit}>
                    Revert and quit
                  </AlertDialogAction>
                </>
              )
              : creator.profileCompleted
              ? (
                <>
                  <AlertDialogCancel onClick={handleConfirmedClose}>
                    No, quit
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => runAfterAlertClosed(handleSaveAndClose)}
                  >
                    Save and quit
                  </AlertDialogAction>
                </>
              )
              : (
                <>
                  <AlertDialogCancel onClick={() => setConfirmingClose(false)}>
                    Keep going
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmedClose}>
                    Quit
                  </AlertDialogAction>
                </>
              )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
