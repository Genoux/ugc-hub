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

interface StepCloseConfirmProps {
  profilePhotoUrl: string | null;
  creatorName: string;
  submissionName: string;
  ratings: CollaborationRatingsInput;
  notes: string;
  piecesOfContent: string;
  totalPaid: string;
  portfolioFiles: PortfolioFile[];
  closedCollabRatings: CollabRatingRow[];
}

export function StepCloseConfirm({
  profilePhotoUrl,
  creatorName,
  submissionName,
  ratings,
  notes,
  piecesOfContent,
  totalPaid,
  portfolioFiles,
  closedCollabRatings,
}: StepCloseConfirmProps) {
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
      <div className="rounded-xl bg-muted/60 p-4 flex items-center gap-3">
        {profilePhotoUrl ? (
          <Image
            src={profilePhotoUrl}
            alt={creatorName}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {creatorName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{creatorName}</p>
          <p className="text-xs text-muted-foreground truncate">{submissionName}</p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <RatingBadge rating={projectedOverall} color="white" />
          </TooltipTrigger>
          <TooltipContent>New overall rating after closing this collaboration</TooltipContent>
        </Tooltip>
      </div>

      <div className="rounded-xl bg-muted/60 divide-y divide-border/50 text-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-muted-foreground">
            {pieces} {pieces === 1 ? "piece" : "pieces"}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">${paid.toFixed(2)}</span>
            {avgPerPiece && <span className="font-medium">${avgPerPiece} avg</span>}
          </div>
        </div>

        {DIMENSION_LABELS.map(({ key, label }) => (
          <div key={key} className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{ratings[key]}</span>
          </div>
        ))}

        <div className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-muted-foreground">This collaboration's rating</span>
          <RatingBadge rating={collabOverall} color="white" />
        </div>

        {portfolioFiles.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-muted-foreground">Portfolio files</span>
            <span className="font-medium">{portfolioFiles.length}</span>
          </div>
        )}
      </div>

      {notes && (
        <div className="px-4 py-3 bg-muted/60 rounded-xl">
          <Label className="text-sm font-medium mb-1.5 block">Notes</Label>
          <p className="text-sm text-muted-foreground italic">{notes}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground px-1">
        This will lock the folder. Admins will only be able to download assets after closing.
      </p>
    </div>
  );
}
