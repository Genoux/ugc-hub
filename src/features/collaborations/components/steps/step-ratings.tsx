"use client";

import { RATING_CONFIG, RATING_TIERS } from "@/features/creators/constants";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { CollaborationRatingsInput } from "../../schemas";

const DIMENSIONS: { key: keyof CollaborationRatingsInput; label: string; description: string }[] = [
  {
    key: "visual_quality",
    label: "Visual Quality",
    description: "Content production and editing skills",
  },
  {
    key: "acting_line_delivery",
    label: "Acting & Delivery",
    description: "On-camera presence, clarity, and line delivery",
  },
  {
    key: "reliability_speed",
    label: "Reliability & Speed",
    description: "Professionalism, follow-through, and timeline adherence",
  },
];

interface StepRatingsProps {
  ratings: Partial<CollaborationRatingsInput>;
  notes: string;
  onChange: (ratings: Partial<CollaborationRatingsInput>) => void;
  onNotesChange: (notes: string) => void;
}

export function StepRatings({ ratings, notes, onChange, onNotesChange }: StepRatingsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/60 p-5 space-y-5">
        {DIMENSIONS.map(({ key, label, description }) => (
          <div key={key}>
            <div className="mb-2">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RATING_TIERS.map((tier) => {
                const isSelected = ratings[key] === tier;
                const config = RATING_CONFIG[tier];
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => onChange({ ...ratings, [key]: tier })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize transition-all ${config.className} ${
                      isSelected
                        ? "ring-2 ring-offset-1 ring-current scale-[1.03] opacity-100"
                        : "opacity-55 hover:opacity-80"
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Anything specific about their performance on this batch..."
          className="h-20 resize-none"
        />
      </div>
    </div>
  );
}
