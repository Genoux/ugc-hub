"use client";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { CONTENT_FORMATS } from "@/features/creators/constants";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function Step4Formats({ data, onChange }: Props) {
  const toggle = (value: string) => {
    const next = data.contentFormats.includes(value)
      ? data.contentFormats.filter((v) => v !== value)
      : [...data.contentFormats, value];
    onChange({ contentFormats: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {CONTENT_FORMATS.map((format) => {
        const checked = data.contentFormats.includes(format);
        const id = `format-${format}`;
        return (
          <div
            key={format}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
              checked
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => toggle(format)}
              className="shrink-0"
            />
            <Label htmlFor={id} className="cursor-pointer text-sm leading-tight font-normal">
              {format}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
