"use client";

import { CONTENT_FORMATS, type ContentFormat } from "@/shared/lib/constants";
import { Button } from "@/shared/components/ui/button";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepStyle({ data, onChange }: Props) {
  const toggle = (value: string) => {
    const next = data.contentFormats.includes(value as ContentFormat)
      ? data.contentFormats.filter((v) => v !== value)
      : [...data.contentFormats, value as ContentFormat];
    onChange({ contentFormats: next });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_FORMATS.map((format) => {
        const selected = data.contentFormats.includes(format);
        return (
          <Button
            key={format}
            type="button"
            variant={selected ? "default" : "outline"}
            onClick={() => toggle(format)}
            className={`text-sm border border-transparent ${
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground "
            }`}
          >
            {format}
          </Button>
        );
      })}
    </div>
  );
}
