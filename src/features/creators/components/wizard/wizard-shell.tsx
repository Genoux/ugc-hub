"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { completeFullProfile } from "../../actions/complete-full-profile";
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

function stepContent(step: number, data: WizardData, onChange: (u: Partial<WizardData>) => void) {
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
      return <Step5Photo data={data} onChange={onChange} />;
    case 6:
      return <Step6Videos data={data} onChange={onChange} />;
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

  const update = (updates: Partial<WizardData>) => setData((prev) => ({ ...prev, ...updates }));
  const isLast = step === TOTAL_STEPS;
  const tip = STEP_TIPS[step];

  const handleSubmit = () => {
    startTransition(async () => {
      await completeFullProfile({
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
    else setStep((s) => s + 1);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
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
          <div className="flex-1 overflow-y-auto px-6 py-5">{stepContent(step, data, update)}</div>

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
              onClick={() => setStep((s) => s - 1)}
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
            disabled={!canProceed(step, data) || isPending}
          >
            {isPending ? "Saving…" : isLast ? "Complete" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
