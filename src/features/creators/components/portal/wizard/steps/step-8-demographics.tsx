"use client";

import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { BIRTH_YEARS, ETHNICITY_OPTIONS, GENDER_OPTIONS } from "../wizard-constants";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function Step8Demographics({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>
          Gender identity <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Select value={data.genderIdentity} onValueChange={(v) => onChange({ genderIdentity: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>
          Year of birth <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Select value={data.ageDemographic} onValueChange={(v) => onChange({ ageDemographic: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {BIRTH_YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>
          Ethnicity <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Select value={data.ethnicity} onValueChange={(v) => onChange({ ethnicity: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {ETHNICITY_OPTIONS.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
