"use client";

import { TogglePills } from "@/shared/components/blocks/toggle-pills";
import { CONTENT_FORMATS, type ContentFormat } from "@/shared/lib/constants";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepStyle({ data, onChange }: Props) {
  return (
    <TogglePills
      options={CONTENT_FORMATS}
      selected={data.contentFormats}
      onToggle={(value) => {
        const next = data.contentFormats.includes(value as ContentFormat)
          ? data.contentFormats.filter((v) => v !== value)
          : [...data.contentFormats, value as ContentFormat];
        onChange({ contentFormats: next });
      }}
    />
  );
}
