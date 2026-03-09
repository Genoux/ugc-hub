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
import {
  AGE_DEMOGRAPHICS,
  type AgeDemographic,
  COUNTRIES,
  ETHNICITIES,
  type Ethnicity,
  GENDER_IDENTITIES,
  type GenderIdentity,
  LANGUAGES,
  type Language,
} from "@/shared/lib/constants";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepAboutYou({ data, onChange }: Props) {
  const toggleLanguage = (lang: string) => {
    const next = data.languages.includes(lang as Language)
      ? data.languages.filter((l) => l !== lang)
      : [...data.languages, lang as Language];
    onChange({ languages: next });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1.5">
        <Label>Shipping country</Label>
        <p className="text-muted-foreground text-xs">
          We ship products to your address for UGC shoots. Make sure your country is correct!
        </p>
        <Select clearable value={data.country} onValueChange={(v) => onChange({ country: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
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

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-2">
          <Label>Gender identity</Label>
          <Select
            clearable
            value={data.genderIdentity}
            onValueChange={(v) => onChange({ genderIdentity: v as GenderIdentity | "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_IDENTITIES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Age group</Label>
          <Select
            clearable
            value={data.ageDemographic}
            onValueChange={(v) => onChange({ ageDemographic: v as AgeDemographic | "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {AGE_DEMOGRAPHICS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ethnicity</Label>
          <Select
            clearable
            value={data.ethnicity}
            onValueChange={(v) => onChange({ ethnicity: v as Ethnicity | "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {ETHNICITIES.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Languages</Label>
          <p className="text-muted-foreground text-xs">
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
                variant={selected ? "default" : "outline"}
                onClick={() => toggleLanguage(lang)}
                className={`text-sm border border-transparent ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground "
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
