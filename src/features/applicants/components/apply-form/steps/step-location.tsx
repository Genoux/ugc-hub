"use client";

import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { COUNTRIES, LANGUAGES } from "@/shared/lib/constants";
import { TogglePills } from "@/shared/components/blocks/toggle-pills";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
}

export function StepLocation({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1.5">
        <Label>Country</Label>
        <Select value={data.country} onValueChange={(v) => onChange({ country: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Languages you can create videos in</Label>
          <p className="text-xs text-muted-foreground">
            Only select languages where you have no accent or a barely noticeable accent.
          </p>
        </div>
        <TogglePills
          options={LANGUAGES}
          selected={data.languages}
          onToggle={(lang) => {
            const next = data.languages.includes(lang)
              ? data.languages.filter((l) => l !== lang)
              : [...data.languages, lang];
            onChange({ languages: next });
          }}
        />
      </div>
    </div>
  );
}
