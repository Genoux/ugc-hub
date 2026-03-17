"use client";

import Image from "next/image";
import { RatingBadge } from "@/shared/components/blocks/rating-badge";
import { Label } from "@/shared/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import type { CollabRatingRow } from "@/shared/lib/calculate-ratings";
import { calculateCreatorRating, calculateOverallRating } from "@/shared/lib/calculate-ratings";
import type { CollaborationRatingsInput } from "../../schemas";
import type { PortfolioFile } from "./step-portfolio";

const DIMENSION_LABELS: { key: keyof CollaborationRatingsInput; label: string }[] = [
  { key: "visual_quality", label: "Visual Quality" },
  { key: "acting_line_delivery", label: "Acting & Delivery" },
  { key: "reliability_speed", label: "Reliability & Speed" },
];

interface StepLogConfirmProps {
  profilePhotoUrl: string | null;
  profilePhotoBlurDataUrl?: string | null;
  creatorName: string;
  collabName: string;
  ratings: CollaborationRatingsInput;
  notes: string;
  piecesOfContent: string;
  totalPaid: string;
  portfolioFiles: PortfolioFile[];
  closedCollabRatings: CollabRatingRow[];
}

export function StepLogConfirm({
  profilePhotoUrl,
  profilePhotoBlurDataUrl,
  creatorName,
  collabName,
  ratings,
  notes,
  piecesOfContent,
  totalPaid,
  portfolioFiles,
  closedCollabRatings,
}: StepLogConfirmProps) {
  const projectedOverall = calculateCreatorRating([
    ...closedCollabRatings,
    {
      ratingVisualQuality: ratings.visual_quality,
      ratingActingDelivery: ratings.acting_line_delivery,
      ratingReliabilitySpeed: ratings.reliability_speed,
    },
  ]);
  const collabOverall = calculateOverallRating(ratings);
  const pieces = parseInt(piecesOfContent, 10);
  const paid = parseFloat(totalPaid);
  const avgPerPiece = pieces > 0 && paid > 0 ? (paid / pieces).toFixed(2) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
        {profilePhotoUrl ? (
          <Image
            src={profilePhotoUrl}
            alt={creatorName}
            width={40}
            height={40}
            unoptimized
            placeholder={profilePhotoBlurDataUrl ? "blur" : "empty"}
            blurDataURL={profilePhotoBlurDataUrl ?? undefined}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {creatorName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{creatorName}</p>
          <p className="truncate text-xs text-muted-foreground">{collabName}</p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <RatingBadge rating={projectedOverall} color="white" />
          </TooltipTrigger>
          <TooltipContent>New overall rating after logging this collaboration</TooltipContent>
        </Tooltip>
      </div>

      <div className="divide-y divide-border/50 rounded-xl bg-muted/60 text-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-foreground">
            {pieces} {pieces === 1 ? "piece" : "pieces"}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">${paid.toFixed(2)}</span>
            {avgPerPiece && <span className="font-medium">${avgPerPiece} avg</span>}
          </div>
        </div>

        {DIMENSION_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{ratings[key]}</span>
          </div>
        ))}

        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-muted-foreground">This collaboration&apos;s rating</span>
          <RatingBadge rating={collabOverall} color="white" />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-foreground">Portfolio files</span>
          <span className="font-medium">{portfolioFiles.length}</span>
        </div>
      </div>

      {notes && (
        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <Label className="mb-1.5 block text-sm font-medium">Notes</Label>
          <p className="text-sm text-muted-foreground italic">{notes}</p>
        </div>
      )}

      <p className="px-1 text-xs text-muted-foreground">
        This will add a closed collaboration to the creator&apos;s profile.
      </p>
    </div>
  );
}
