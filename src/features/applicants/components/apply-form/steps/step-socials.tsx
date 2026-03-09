"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ApplyData } from "../apply-form";

interface Props {
  data: ApplyData;
  onChange: (updates: Partial<ApplyData>) => void;
  portfolioUrlError: string | null;
}

export function StepSocials({ data, onChange, portfolioUrlError }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">At least one social URL is required.</p>
      <div className="space-y-1.5">
        <Label htmlFor="instagram">Instagram URL</Label>
        <Input
          id="instagram"
          type="url"
          value={data.instagram_url}
          onChange={(e) => onChange({ instagram_url: e.target.value })}
          placeholder="https://instagram.com/yourhandle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tiktok">TikTok URL</Label>
        <Input
          id="tiktok"
          type="url"
          value={data.tiktok_url}
          onChange={(e) => onChange({ tiktok_url: e.target.value })}
          placeholder="https://tiktok.com/@yourhandle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="youtube">YouTube URL</Label>
        <Input
          id="youtube"
          type="url"
          value={data.youtube_url}
          onChange={(e) => onChange({ youtube_url: e.target.value })}
          placeholder="https://youtube.com/@yourhandle"
        />
      </div>
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
        {portfolioUrlError && <p className="text-xs text-destructive">{portfolioUrlError}</p>}
      </div>
    </div>
  );
}
