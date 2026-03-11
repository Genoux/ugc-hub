"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/shared/components/ui/combobox";
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
  const ethnicityAnchor = useComboboxAnchor();
  const languageAnchor = useComboboxAnchor();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Label>Shipping country</Label>
        <p className="text-muted-foreground text-xs">
          We ship products to your address for UGC shoots. Make sure your country is correct!
        </p>
        <Combobox
          items={COUNTRIES}
          value={data.country}
          onValueChange={(v) => onChange({ country: v ?? "" })}
        >
          <ComboboxTrigger
            render={
              <Button variant="outline" className="min-w-40 justify-between font-normal rounded-md">
                <ComboboxValue placeholder="Select country" />
              </Button>
            }
          />
          <ComboboxContent>
            <ComboboxInput showTrigger={false} placeholder="Search countries..." />
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {(country) => (
                <ComboboxItem key={country} value={country}>
                  {country}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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
      </div>

      <div className="space-y-2">
        <Label>Ethnicity</Label>
        <Combobox
          items={ETHNICITIES}
          multiple
          value={data.ethnicities}
          onValueChange={(v) => onChange({ ethnicities: v as Ethnicity[] })}
        >
          <ComboboxChips ref={ethnicityAnchor}>
            <ComboboxValue>
              {data.ethnicities.map((e) => (
                <ComboboxChip key={e}>{e}</ComboboxChip>
              ))}
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Search ethnicities..." />
          </ComboboxChips>
          <ComboboxContent anchor={ethnicityAnchor}>
            <ComboboxEmpty>No ethnicities found.</ComboboxEmpty>
            <ComboboxList>
              {(e) => (
                <ComboboxItem key={e} value={e}>
                  {e}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <p className="text-muted-foreground text-xs">
          Only select languages where you have no accent or a barely noticeable accent.
        </p>
        <Combobox
          items={LANGUAGES}
          multiple
          value={data.languages}
          onValueChange={(v) => onChange({ languages: v as Language[] })}
        >
          <ComboboxChips ref={languageAnchor}>
            <ComboboxValue>
              {data.languages.map((lang) => (
                <ComboboxChip key={lang}>{lang}</ComboboxChip>
              ))}
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Search languages..." />
          </ComboboxChips>
          <ComboboxContent anchor={languageAnchor}>
            <ComboboxEmpty>No languages found.</ComboboxEmpty>
            <ComboboxList>
              {(lang) => (
                <ComboboxItem key={lang} value={lang}>
                  {lang}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
