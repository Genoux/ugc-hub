"use client";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { COUNTRIES, LANGUAGES } from "@/shared/lib/constants";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
}

export function StepLocation({ data, onChange }: Props) {
  const toggleLanguage = (lang: string) => {
    const next = data.languages.includes(lang)
      ? data.languages.filter((l) => l !== lang)
      : [...data.languages, lang];
    onChange({ languages: next });
  };

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
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => {
            const selected = data.languages.includes(lang);
            return (
              <Button
                key={lang}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                onClick={() => toggleLanguage(lang)}
                className={`border ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground"
                }`}
              >
                {lang}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
