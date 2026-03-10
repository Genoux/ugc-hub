"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { submitApplication } from "@/features/applicants/actions/submit-application";
import { Button } from "@/shared/components/ui/button";
import { ProgressDots } from "@/shared/components/wizard/progress-dots";
import {
  Wizard,
  WizardAside,
  WizardDescription,
  WizardFooter,
  WizardPanel,
  WizardStep,
  WizardTitle,
} from "@/shared/components/wizard/wizard";
import { WizardComplete } from "@/shared/components/wizard/wizard-complete";
import { useSteppedFlow } from "@/shared/hooks/use-stepped-flow";
import { APPLY_STEPS, TOTAL_APPLY_STEPS } from "./apply-constants";
import { StepEmail } from "./steps/step-email";
import { StepIdentity } from "./steps/step-identity";
import { StepLocation } from "./steps/step-location";
import { StepSocials } from "./steps/step-socials";

export interface ApplyData {
  fullName: string;
  email: string;
  country: string;
  languages: string[];
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  portfolioUrl: string;
}

const INITIAL_DATA: ApplyData = {
  fullName: "",
  email: "",
  country: "",
  languages: [],
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  portfolioUrl: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function canProceed(step: number, data: ApplyData): boolean {
  switch (step) {
    case 1:
      return data.fullName.trim().length > 0;
    case 2:
      return data.country.trim().length > 0 && data.languages.length > 0;
    case 3:
      return (
        (isValidUrl(data.instagram_url) ||
          isValidUrl(data.tiktok_url) ||
          isValidUrl(data.youtube_url)) &&
        (!data.instagram_url || isValidUrl(data.instagram_url)) &&
        (!data.tiktok_url || isValidUrl(data.tiktok_url)) &&
        (!data.youtube_url || isValidUrl(data.youtube_url)) &&
        (!data.portfolioUrl || isValidUrl(data.portfolioUrl))
      );
    case 4:
      return isValidEmail(data.email);
    default:
      return false;
  }
}

function StepContent({
  step,
  data,
  onChange,
  submitError,
}: {
  step: number;
  data: ApplyData;
  onChange: (u: Partial<ApplyData>) => void;
  submitError: string | null;
}) {
  switch (step) {
    case 1:
      return <StepIdentity data={data} onChange={onChange} />;
    case 2:
      return <StepLocation data={data} onChange={onChange} />;
    case 3:
      return (
        <StepSocials
          data={data}
          onChange={onChange}
          portfolioUrlError={
            !!data.portfolioUrl && !isValidUrl(data.portfolioUrl)
              ? "Must be a valid URL (e.g. https://yoursite.com)"
              : null
          }
        />
      );
    case 4:
      return <StepEmail data={data} onChange={onChange} error={submitError} />;
    case 5:
      return (
        <WizardComplete
          className="items-center"
          title="Application submitted"
          description="We'll review your application and get back to you soon."
        >
          <div className="flex flex-col w-full gap-2 justify-center">
            <p className="text-sm text-center text-muted-foreground">You can close this page.</p>
          </div>
        </WizardComplete>
      );
    default:
      return null;
  }
}

const FORM_STEPS = 4;

export function ApplyForm() {
  const { step, goToStep, directionRef } = useSteppedFlow(TOTAL_APPLY_STEPS);
  const [data, setData] = useState<ApplyData>(INITIAL_DATA);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = (updates: Partial<ApplyData>) => setData((prev) => ({ ...prev, ...updates }));

  const isLastFormStep = step === FORM_STEPS;
  const isResultStep = step === TOTAL_APPLY_STEPS;

  const filledSteps = new Set(
    Array.from({ length: FORM_STEPS }, (_, i) => i + 1).filter((s) => canProceed(s, data)),
  );

  const handleSubmit = () => {
    startTransition(async () => {
      setSubmitError(null);
      const response = await submitApplication({
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        languages: data.languages,
        instagram_url: data.instagram_url || undefined,
        tiktok_url: data.tiktok_url || undefined,
        youtube_url: data.youtube_url || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
      });

      if (response.success) {
        goToStep(5);
        return;
      }

      if (response.conflict) {
        setSubmitError("An application with this email already exists.");
        return;
      }

      setSubmitError("Something went wrong. Please try again.");
    });
  };

  const handleNext = () => {
    if (isLastFormStep) handleSubmit();
    else goToStep(step + 1);
  };

  const asideStep = Math.min(step, 4);

  return (
    <Wizard variant="page">
      <WizardPanel isPending={isPending}>
        <div className="absolute left-12 top-12 z-10">
          <Image src="/inBeat.svg" alt="" width={40} height={40} unoptimized />
        </div>
        <WizardStep stepKey={step} direction={directionRef.current} className="h-[600px]">
          {!isResultStep && (
            <div className="flex flex-col gap-2">
              <WizardTitle>{APPLY_STEPS[step].header}</WizardTitle>
              <WizardDescription>{APPLY_STEPS[step].body}</WizardDescription>
            </div>
          )}

          <StepContent step={step} data={data} onChange={update} submitError={submitError} />

          {!isResultStep && (
            <WizardFooter>
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(step - 1)}
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
                disabled={!canProceed(step, data) || isPending}
              >
                {isPending ? "Submitting…" : isLastFormStep ? "Submit" : "Next"}
              </Button>
            </WizardFooter>
          )}
        </WizardStep>

        {!isResultStep && (
          <div className="flex mx-auto justify-start ">
            <ProgressDots
              className="w-full flex justify-start"
              variant="dots"
              current={step}
              steps={APPLY_STEPS}
              filledSteps={filledSteps}
              onStepClick={goToStep}
            />
          </div>
        )}
      </WizardPanel>
      <WizardAside stepKey={asideStep} direction={directionRef.current} visible={!isResultStep}>
        <Image
          src={`/creator/onboarding/step${asideStep}.jpg`}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
      </WizardAside>
    </Wizard>
  );
}
