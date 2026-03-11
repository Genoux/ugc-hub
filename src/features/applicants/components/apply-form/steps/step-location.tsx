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
import { COUNTRIES, LANGUAGES } from "@/shared/lib/constants";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
}

export function StepLocation({ data, onChange }: Props) {
  const languageAnchor = useComboboxAnchor();

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1.5">
        <Label>Country</Label>
        <Combobox
          items={COUNTRIES}
          value={data.country}
          onValueChange={(v) => onChange({ country: v ?? "" })}
        >
          <ComboboxTrigger
            render={
              <Button variant="outline" className="w-full justify-between font-normal rounded-md">
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

      <div className="space-y-2">
        <Label>Languages you can create videos in</Label>
        <p className="text-xs text-muted-foreground">
          Only select languages where you have no accent or a barely noticeable accent.
        </p>
        <Combobox
          items={LANGUAGES}
          multiple
          value={data.languages}
          onValueChange={(v) => onChange({ languages: v as string[] })}
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
