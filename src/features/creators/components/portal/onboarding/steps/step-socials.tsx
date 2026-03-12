"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepSocials({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="instagram">Instagram URL</Label>
        <Input
          id="instagram"
          type="url"
          value={data.instagramUrl}
          onChange={(e) => onChange({ instagramUrl: e.target.value })}
          placeholder="https://instagram.com/yourhandle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tiktok">TikTok URL</Label>
        <Input
          id="tiktok"
          type="url"
          value={data.tiktokUrl}
          onChange={(e) => onChange({ tiktokUrl: e.target.value })}
          placeholder="https://tiktok.com/@yourhandle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="youtube">YouTube URL</Label>
        <Input
          id="youtube"
          type="url"
          value={data.youtubeUrl}
          onChange={(e) => onChange({ youtubeUrl: e.target.value })}
          placeholder="https://youtube.com/@yourhandle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="portfolio">
          Portfolio or examples of your work{" "}
          <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="portfolio"
          type="url"
          value={data.portfolioUrl}
          onChange={(e) => onChange({ portfolioUrl: e.target.value })}
          placeholder="https://yourportfolio.com"
        />
        <p className="text-xs text-muted-foreground">
          Don't have a portfolio? Share an updated Google Drive link with samples of your work
        </p>
      </div>
    </div>
  );
}
