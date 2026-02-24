"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { completeCreatorProfile } from "@/features/creators/actions/portal/complete-creator-profile";
import {
  type PortfolioVideoManager,
  usePortfolioVideoManager,
} from "@/features/creators/hooks/use-portfolio-video-manager";
import {
  type ProfilePhotoManager,
  useProfilePhotoManager,
} from "@/features/creators/hooks/use-profile-photo-manager";
import { DevToolbar } from "@/shared/components/tools/dev-toolbar";
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
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { STEP_TIPS } from "./onboarding-constants";
import {
  buildOnboardingData,
  canProceed,
  type OnboardingData,
  type OnboardingProps,
} from "./onboarding-types";
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
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={label}
    >
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
      return <StepComplete error={submitError} onExit={onExitResult} onRetry={onRetryResult} />;
    default:
      return null;
  }
}

export function OnboardingShell({ creator, onComplete, onClose }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => buildOnboardingData(creator));
  const [isPending, startTransition] = useTransition();
  const [confirmingClose, setConfirmingClose] = useState(false);
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
  const update = (updates: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...updates }));
  const isLastFormStep = step === 8;
  const isResultStep = step === TOTAL_STEPS;
  const directionRef = useRef<1 | -1>(1);

  const handleStepChange = (next: number) => {
    directionRef.current = next > step ? 1 : -1;
    setSubmitError(null);
    setStep(next);
  };

  const handleRequestClose = () => {
    if (isResultStep) {
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
      setSubmitError(null);
      try {
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
        setStep(9);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
        setStep(9);
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

  const stepCanProceed = canProceed(step, data, videoManager.completedCount);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 500 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 500 }}
        transition={{
          ease: EASING_FUNCTION.exponential,
          duration: 0.4,
        }}
        className="fixed inset-0 flex min-h-[max(775px,100vh)] flex-col overflow-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <div className="flex min-h-0 flex-1 overflow-hidden bg-cream p-4">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-4xl bg-white shadow-hub">
            <div className="relative flex h-full w-full flex-col">
              <div className="flex shrink-0 items-center justify-between w-full p-4">
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
              </div>
              <div className="flex min-h-0 flex-1 overflow-y-auto px-12">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: directionRef.current * 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: directionRef.current * -12 }}
                    transition={{ duration: 0.3, ease: EASING_FUNCTION.quartic }}
                    className="mx-auto flex min-h-full w-full max-w-xl flex-col"
                  >
                    <div className="flex flex-1 flex-col justify-center gap-6">
                      {!isResultStep && (
                        <div className="flex flex-col gap-2">
                          <h1 id="wizard-title" className="text-4xl font-medium">
                            {STEP_TIPS[step].header}
                          </h1>
                          <p className="text-sm text-muted-foreground">{STEP_TIPS[step].body}</p>
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
                      <ProgressDots current={step} total={TOTAL_STEPS} label="Step progress" />
                    </div>

                    {!isResultStep && (
                      <div className="flex w-full items-center justify-between gap-4 pt-8 mb-40">
                        {step > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleStepChange(step - 1)}
                            disabled={isPending}
                          >
                            Back
                          </Button>
                        ) : (
                          <span />
                        )}
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            !stepCanProceed ||
                            isPending ||
                            (step === 5 && photoManager.isUploading) ||
                            (step === 6 && videoManager.isUploading)
                          }
                          className="min-w-28"
                        >
                          {isPending ? "Saving…" : isLastFormStep ? "Complete" : "Continue"}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.aside
            animate={
              isResultStep
                ? { width: 0, minWidth: 0, opacity: 0, x: 12, paddingLeft: 0 }
                : { opacity: 1 }
            }
            transition={{ duration: 0.6, ease: EASING_FUNCTION.exponential }}
            className="hidden xl:flex shrink-0 overflow-hidden w-[min(536px,40vw)] min-w-[280px] pl-4"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: directionRef.current * 21 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: directionRef.current * -21 }}
                transition={{ duration: 0.3, ease: EASING_FUNCTION.quartic }}
                className="relative h-full w-full overflow-hidden rounded-4xl shadow-hub"
              >
                <Image
                  src={`/creator/onboarding/step${step}.jpg`}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </div>
      </motion.div>

      <DevToolbar
        context={`Onboarding · step ${step}/${TOTAL_STEPS}`}
        tools={[
          {
            label: "Skip to last step",
            action: () => handleStepChange(TOTAL_STEPS),
          },
          ...Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => ({
            label: `Go to step ${i + 1}`,
            action: () => handleStepChange(i + 1),
          })),
        ]}
      />

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
