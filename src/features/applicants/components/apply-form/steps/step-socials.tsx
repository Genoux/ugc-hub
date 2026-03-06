"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
  portfolioUrlError: string | null;
}

function HandleInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground select-none">
          @
        </span>
        <Input
          id={id}
          className="pl-7"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/^@/, ""))}
          placeholder="yourhandle"
        />
      </div>
    </div>
  );
}

export function StepSocials({ data, onChange, portfolioUrlError }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">At least one social handle is required.</p>
      <HandleInput
        id="instagram"
        label="Instagram handle"
        value={data.instagram_handle}
        onChange={(v) => onChange({ instagram_handle: v })}
      />
      <HandleInput
        id="tiktok"
        label="TikTok handle"
        value={data.tiktok_handle}
        onChange={(v) => onChange({ tiktok_handle: v })}
      />
      <HandleInput
        id="youtube"
        label="YouTube handle"
        value={data.youtube_handle}
        onChange={(v) => onChange({ youtube_handle: v })}
      />
      <div className="space-y-1.5">
        <Label htmlFor="portfolioUrl">
          Portfolio URL <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="portfolioUrl"
          type="url"
          value={data.portfolioUrl}
          onChange={(e) => onChange({ portfolioUrl: e.target.value })}
          placeholder="https://yourportfolio.com"
        />
        {portfolioUrlError && (
          <p className="text-xs text-destructive">{portfolioUrlError}</p>
        )}
      </div>
    </div>
  );
}
