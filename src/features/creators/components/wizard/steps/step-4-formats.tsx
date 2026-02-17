"use client";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { CONTENT_FORMATS } from "../wizard-constants";
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
        return (
          <label
            key={format}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              checked
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <Checkbox checked={checked} onCheckedChange={() => toggle(format)} className="shrink-0" />
            <span className="leading-tight">{format}</span>
          </label>
        );
      })}
    </div>
  );
}
