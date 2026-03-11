"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
  error: string | null;
}

export function StepEmail({ data, onChange, error }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <Input
        id="email"
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="jane@example.com"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
