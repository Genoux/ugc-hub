"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
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
        <span className="text-muted-foreground absolute inset-y-0 left-3 flex items-center text-sm select-none">
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

export function Step2Socials({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <HandleInput
        id="instagram"
        label="Instagram handle"
        value={data.instagramHandle}
        onChange={(v) => onChange({ instagramHandle: v })}
      />
      <HandleInput
        id="tiktok"
        label="TikTok handle"
        value={data.tiktokHandle}
        onChange={(v) => onChange({ tiktokHandle: v })}
      />
      <HandleInput
        id="youtube"
        label="YouTube handle"
        value={data.youtubeHandle}
        onChange={(v) => onChange({ youtubeHandle: v })}
      />

      <div className="space-y-1.5">
        <Label htmlFor="portfolio">
          Portfolio URL{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="portfolio"
          type="url"
          value={data.portfolioUrl}
          onChange={(e) => onChange({ portfolioUrl: e.target.value })}
          placeholder="https://yourportfolio.com"
        />
      </div>
    </div>
  );
}
