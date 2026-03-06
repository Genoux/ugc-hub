"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
}

export function StepIdentity({ data, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fullName">Full name</Label>
      <Input
        id="fullName"
        value={data.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        placeholder="Jane Smith"
      />
    </div>
  );
}
