"use client";

import { UGC_CATEGORIES } from "@/features/creators/constants";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
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
        const id = `category-${category}`;
        return (
          <div
            key={category}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
              checked
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => toggle(category)}
              className="shrink-0"
            />
            <Label htmlFor={id} className="cursor-pointer text-sm leading-tight font-normal">
              {category}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
