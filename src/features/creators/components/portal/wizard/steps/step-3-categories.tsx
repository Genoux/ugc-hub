"use client";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { UGC_CATEGORIES } from "../wizard-constants";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function Step3Categories({ data, onChange }: Props) {
  const toggle = (value: string) => {
    const next = data.ugcCategories.includes(value)
      ? data.ugcCategories.filter((v) => v !== value)
      : [...data.ugcCategories, value];
    onChange({ ugcCategories: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {UGC_CATEGORIES.map((category) => {
        const checked = data.ugcCategories.includes(category);
        return (
          <label
            key={category}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              checked
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => toggle(category)}
              className="shrink-0"
            />
            <span className="leading-tight">{category}</span>
          </label>
        );
      })}
    </div>
  );
}
