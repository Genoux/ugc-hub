"use client";

import { UGC_CATEGORIES } from "@/features/creators/constants";
import { Button } from "@/shared/components/ui/button";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepNiche({ data, onChange }: Props) {
  const toggle = (value: string) => {
    const next = data.ugcCategories.includes(value)
      ? data.ugcCategories.filter((v) => v !== value)
      : [...data.ugcCategories, value];
    onChange({ ugcCategories: next });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {UGC_CATEGORIES.map((category) => {
        const selected = data.ugcCategories.includes(category);
        return (
          <Button
            key={category}
            type="button"
            variant={selected ? "default" : "outline"}
            onClick={() => toggle(category)}
            className={`text-sm border border-transparent ${
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground "
            }`}
          >
            {category}
          </Button>
        );
      })}
    </div>
  );
}
