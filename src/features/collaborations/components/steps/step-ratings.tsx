"use client";

import { TogglePills } from "@/shared/components/blocks/toggle-pills";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RATING_TIERS } from "@/shared/lib/constants";
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
      {DIMENSIONS.map(({ key, label, description }) => (
        <div key={key} className="space-y-2">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <TogglePills
            options={RATING_TIERS}
            selected={ratings[key] ? [ratings[key] as string] : []}
            onToggle={(tier) => onChange({ ...ratings, [key]: tier })}
          />
        </div>
      ))}
      <hr />
      <div>
        <Label className="text-sm font-medium mb-1.5 block">
          Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Anything specific about their performance on this submission..."
          className="h-20 resize-none"
        />
      </div>
    </div>
  );
}
