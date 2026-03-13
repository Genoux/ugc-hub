"use client";

import { TogglePills } from "@/shared/components/blocks/toggle-pills";
import { UGC_CATEGORIES, type UgcCategory } from "@/shared/lib/constants";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepNiche({ data, onChange }: Props) {
  return (
    <TogglePills
      options={UGC_CATEGORIES}
      selected={data.ugcCategories}
      onToggle={(value) => {
        const next = data.ugcCategories.includes(value as UgcCategory)
          ? data.ugcCategories.filter((v) => v !== value)
          : [...data.ugcCategories, value as UgcCategory];
        onChange({ ugcCategories: next });
      }}
    />
  );
}
