"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { RATE_BANDS } from "@/shared/lib/constants";
import type { OnboardingData } from "../onboarding-types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

const RATE_BAND_TOOLTIPS: Record<string, string> = {
  "Getting started":
    "You have some experience, but you're still building. This range is a good fit if you want to grow your portfolio, work with bigger brands, and get more collaboration opportunities.",
  "Standard Rates (Most Collabs)":
    "Our most common rate range for one UGC deliverable. Best fit for creators doing solid, standard UGC work with a strong chance of getting booked regularly.",
  "Premium UGC":
    "For creators with proven experience producing higher-end UGC. This can include things like street interviews, podcast-style content, strong on-camera performance, polished hooks, props, or filming with more advanced gear.",
  "Specialty / Super Niche (Rare)":
    "For rare, highly specific, or harder-to-produce content. This can include advanced videography, complex setups, unusual locations, athletic or technical shoots, or niche creative skills that most creators can't offer.",
};

const TAG_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-blue-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-700",
};

export function StepRates({ data, onChange }: Props) {
  const isSelected = (band: (typeof RATE_BANDS)[number]) =>
    data.rateRangeSelf?.min === band.value.min && data.rateRangeSelf?.max === band.value.max;

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {RATE_BANDS.map((band) => (
          <button
            key={band.label}
            type="button"
            onClick={() => onChange({ rateRangeSelf: band.value })}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${isSelected(band)
              ? "border-foreground font-medium"
              : "border-border hover:border-foreground/30"
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{band.label} per video</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`${TAG_CLASSES[band.tagColor]}`}
                  >
                    {band.tag}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  {RATE_BAND_TOOLTIPS[band.tag]}
                </TooltipContent>
              </Tooltip>
            </div>
          </button>
        ))}
      </div>
    </TooltipProvider>
  );
}
