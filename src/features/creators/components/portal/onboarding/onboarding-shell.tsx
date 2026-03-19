"use client";

import { CheckIcon, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { completeCreatorProfile } from "@/features/creators/actions/portal/complete-creator-profile";
import { usePortfolioVideoUpload } from "@/features/creators/hooks/portal/use-portfolio-video-upload";
import { putToR2 } from "@/features/uploads/lib/r2-upload";
import { buildOnboardingData, canProceed, MAX_PORTFOLIO_VIDEOS } from "@/features/creators/lib/onboarding-utils";
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
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import type { AgeDemographic, Ethnicity, GenderIdentity } from "@/shared/lib/constants";
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

type PendingVideoFile = { file: File; objectUrl: string };
type ExistingVideo = { id: string; url: string; filename: string };

interface StepContentProps {
  step: number;
  data: OnboardingData;
  onChange: (u: Partial<OnboardingData>) => void;
  photoPreviewUrl: string | null;
  onPhotoChange: (file: File, previewUrl: string) => void;
  existingVideos: ExistingVideo[];
  pendingVideoFiles: PendingVideoFile[];
  onExistingVideoRemove: (id: string) => void;
  onVideosAdd: (files: File[]) => void;
  onVideoRemove: (index: number) => void;
  submitError: string | null;
  onExitResult: () => void;
  onRetryResult: () => void;
}

function StepContent({
  step,
  data,
  onChange,
  photoPreviewUrl,
  onPhotoChange,
  existingVideos,
  pendingVideoFiles,
  onExistingVideoRemove,
  onVideosAdd,
  onVideoRemove,
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
          previewUrl={photoPreviewUrl}
          onFileChange={onPhotoChange}
          onChange={(key) => onChange({ profilePhoto: key })}
        />
      );
    case 6:
      return (
        <StepVideos
          existingVideos={existingVideos}
          pendingFiles={pendingVideoFiles}
          onExistingRemove={onExistingVideoRemove}
          onFilesAdd={onVideosAdd}
          onFileRemove={onVideoRemove}
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
  const router = useRouter();
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_STEPS);
  const [data, setData] = useState<OnboardingData>(() => buildOnboardingData(creator));
  const [isPending, startTransition] = useTransition();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const initialData = useRef(buildOnboardingData(creator));
  const initialPhotoUrl = useRef(creator.profilePhotoUrl ?? null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(creator.profilePhotoUrl ?? null);

  const [existingVideos, setExistingVideos] = useState<ExistingVideo[]>(() =>
    creator.portfolioVideos.map((v) => ({ id: v.id, url: v.url, filename: v.filename })),
  );
  const [pendingVideoFiles, setPendingVideoFiles] = useState<PendingVideoFile[]>([]);
  const { upload: uploadVideos, resultsRef: videoResultsRef, resetResults: resetVideoResults } =
    usePortfolioVideoUpload(creator.id);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState<"incomplete" | "leave_save" | "quit" | null>(null);
  const update = (updates: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...updates }));

  const isLastFormStep = step === 8;
  const isResultStep = step === TOTAL_STEPS;
  const pendingCloseActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const ALERT_CLOSE_MS = 250;

  const videoCount = existingVideos.length + pendingVideoFiles.length;

  const handleStepChange = (next: number) => {
    setSubmitError(null);
    goToStep(next);
  };

  const hasChanges = () => {
    if (JSON.stringify(data) !== JSON.stringify(initialData.current)) return true;
    if (pendingPhotoFile !== null) return true;
    if (existingVideos.length !== creator.portfolioVideos.length) return true;
    if (pendingVideoFiles.length > 0) return true;
    return false;
  };

  const handleRequestClose = () => {
    const hc = hasChanges();
    if (isResultStep) {
      onClose();
      return;
    }
    if (creator.profileCompleted && !hc) {
      onClose();
      return;
    }
    const allComplete = [1, 2, 3, 4, 5, 6, 7, 8].every((s) =>
      canProceed(s, data, videoCount),
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

  const discardPendingChanges = () => {
    if (pendingPhotoFile) URL.revokeObjectURL(photoPreviewUrl ?? "");
    setPendingPhotoFile(null);
    setPhotoPreviewUrl(initialPhotoUrl.current);
    for (const pf of pendingVideoFiles) URL.revokeObjectURL(pf.objectUrl);
    setPendingVideoFiles([]);
    setExistingVideos(creator.portfolioVideos.map((v) => ({ id: v.id, url: v.url, filename: v.filename })));
  };

  const handleConfirmedClose = () => {
    runAfterAlertClosed(() => {
      discardPendingChanges();
      onClose();
    });
  };

  const handleRevertAndQuit = () => {
    runAfterAlertClosed(() => {
      setData(initialData.current);
      discardPendingChanges();
      onClose();
    });
  };

  const buildProfilePayload = (resolvedPhotoKey: string) => ({
    fullName: data.fullName,
    country: data.country,
    languages: data.languages,
    socialChannels: {
      instagram_url: data.instagramUrl || undefined,
      tiktok_url: data.tiktokUrl || undefined,
      youtube_url: data.youtubeUrl || undefined,
    },
    portfolioUrl: data.portfolioUrl || undefined,
    ugcCategories: data.ugcCategories,
    contentFormats: data.contentFormats,
    profilePhoto: resolvedPhotoKey,
    rateRangeSelf: data.rateRangeSelf ?? undefined,
    genderIdentity: data.genderIdentity as GenderIdentity,
    ageDemographic: data.ageDemographic as AgeDemographic,
    ethnicities: data.ethnicities as Ethnicity[],
  });

  const resolveProfilePhoto = async (): Promise<string> => {
    if (!pendingPhotoFile) return data.profilePhoto;

    const res = await fetch("/api/uploads/creator-profile/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId: creator.id,
        filename: pendingPhotoFile.name,
        mimeType: pendingPhotoFile.type,
        fileSize: pendingPhotoFile.size,
        assetType: "profile_picture",
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Failed to upload profile photo");
    }
    const { uploadUrl, key } = await res.json();
    await putToR2(pendingPhotoFile, uploadUrl);
    setPendingPhotoFile(null);
    return key;
  };

  const resolveVideoUploads = async () => {
    if (pendingVideoFiles.length === 0) return [];
    resetVideoResults();
    await uploadVideos(pendingVideoFiles.map((pf) => pf.file));
    for (const pf of pendingVideoFiles) URL.revokeObjectURL(pf.objectUrl);
    setPendingVideoFiles([]);
    return videoResultsRef.current.map(({ file, key }) => ({
      key,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }));
  };

  const handleSaveAndClose = () => {
    startTransition(async () => {
      try {
        const photoKey = await resolveProfilePhoto();
        const newVideos = await resolveVideoUploads();
        await completeCreatorProfile({
          ...buildProfilePayload(photoKey),
          keepVideoIds: existingVideos.map((v) => v.id),
          newVideos,
        });
        router.refresh();
        onClose();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
        setConfirmingClose(false);
      }
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setSubmitError(null);
      try {
        const photoKey = await resolveProfilePhoto();
        const newVideos = await resolveVideoUploads();
        await completeCreatorProfile({
          ...buildProfilePayload(photoKey),
          keepVideoIds: existingVideos.map((v) => v.id),
          newVideos,
        });
        router.refresh();
        if (creator.profileCompleted) {
          onClose();
        } else {
          goToStep(9);
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
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

  const stepCanProceed = canProceed(step, data, videoCount);
  const allStepsComplete = [1, 2, 3, 4, 5, 6, 7, 8].every((s) => canProceed(s, data, videoCount));
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
              variant="outline"
              size="icon"
              onClick={handleRequestClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
            {creator.profileCompleted && !isResultStep ? (
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={handleSaveAndClose}
                disabled={!allStepsComplete || isPending}
                aria-label="Save and close"
              >
                <CheckIcon className="size-5" />
              </Button>
            ) : (
              <span />
            )}
          </WizardHeader>

          <div className="flex flex-1 min-h-0 flex-col gap-4">
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
                photoPreviewUrl={photoPreviewUrl}
                onPhotoChange={(file, previewUrl) => {
                  if (pendingPhotoFile && photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                  setPendingPhotoFile(file);
                  setPhotoPreviewUrl(previewUrl);
                }}
                existingVideos={existingVideos}
                pendingVideoFiles={pendingVideoFiles}
                onExistingVideoRemove={(id) =>
                  setExistingVideos((prev) => prev.filter((v) => v.id !== id))
                }
                onVideosAdd={(files) => {
                  const available = MAX_PORTFOLIO_VIDEOS - videoCount;
                  const toAdd = files.slice(0, available).map((file) => ({
                    file,
                    objectUrl: URL.createObjectURL(file),
                  }));
                  setPendingVideoFiles((prev) => [...prev, ...toAdd]);
                }}
                onVideoRemove={(index) => {
                  setPendingVideoFiles((prev) => {
                    URL.revokeObjectURL(prev[index].objectUrl);
                    return prev.filter((_, i) => i !== index);
                  });
                }}
                submitError={submitError}
                onExitResult={handleExitResult}
                onRetryResult={() => handleStepChange(8)}
              />
              {!isResultStep && (
                <WizardFooter>
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
                    disabled={!stepCanProceed || isPending}
                  >
                    {isPending
                      ? "Saving…"
                      : isLastFormStep
                        ? creator.profileCompleted
                          ? "Save"
                          : "Complete"
                        : "Next"}
                  </Button>
                </WizardFooter>
              )}
            </WizardStep>

            {!isResultStep && creator.profileCompleted && (
              <div className="w-full flex justify-center pb-12">
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

        <WizardAside stepKey={step} direction={directionRef.current} visible={!isResultStep}>
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
            {closeReason === "incomplete" ? (
              <>
                <AlertDialogCancel onClick={() => setConfirmingClose(false)}>
                  Stay
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleRevertAndQuit}>Revert and quit</AlertDialogAction>
              </>
            ) : creator.profileCompleted ? (
              <>
                <AlertDialogCancel onClick={handleConfirmedClose}>No, quit</AlertDialogCancel>
                <AlertDialogAction onClick={() => runAfterAlertClosed(handleSaveAndClose)}>
                  Save and quit
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogCancel onClick={() => setConfirmingClose(false)}>
                  Keep going
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmedClose}>Quit</AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
