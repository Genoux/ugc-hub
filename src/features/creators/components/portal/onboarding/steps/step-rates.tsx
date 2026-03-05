"use client";

import { RATE_BANDS } from "@/shared/lib/constants";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepRates({ data, onChange }: Props) {
  const isSelected = (band: (typeof RATE_BANDS)[number]) =>
    data.rateRangeSelf?.min === band.value.min && data.rateRangeSelf?.max === band.value.max;

  return (
    <div className="space-y-2">
      {RATE_BANDS.map((band) => (
        <button
          key={band.label}
          type="button"
          onClick={() => onChange({ rateRangeSelf: band.value })}
          className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
            isSelected(band)
              ? "border-foreground bg-foreground/5 font-medium"
              : "border-border hover:border-foreground/30"
          }`}
        >
          {band.label} per video
        </button>
      ))}
    </div>
  );
}
