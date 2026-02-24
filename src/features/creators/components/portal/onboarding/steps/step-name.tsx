"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepName({ data, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fullName">Full name</Label>
      <Input
        value={data.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        placeholder="Jane Smith"
      />
    </div>
  );
}
