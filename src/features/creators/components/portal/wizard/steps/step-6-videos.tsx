"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function Step6Videos({ data, onChange }: Props) {
  const urls = data.portfolioVideoUrls.length >= 2 ? data.portfolioVideoUrls : ["", ""];

  const update = (idx: number, value: string) => {
    const next = [...urls];
    next[idx] = value;
    onChange({ portfolioVideoUrls: next });
  };

  const add = () => {
    if (urls.length < 5) onChange({ portfolioVideoUrls: [...urls, ""] });
  };

  const remove = (idx: number) => {
    onChange({ portfolioVideoUrls: urls.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Add 2–5 links to your best vertical videos (TikTok, Instagram Reels, YouTube Shorts, or
        direct links).
      </p>
      <div className="space-y-2">
        {urls.map((url, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={`Video ${idx + 1} URL`}
              type="url"
            />
            {urls.length > 2 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {urls.length < 5 && (
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4 mr-1" />
          Add video
        </Button>
      )}
    </div>
  );
}
