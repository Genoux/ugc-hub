"use client";

import { RATING_CONFIG } from "@/features/creators/constants";
import { calculateOverallRating } from "../../lib/calculate-overall-rating";
import type { CollaborationRatingsInput } from "../../schemas";
import type { PortfolioFile } from "./step-portfolio";

interface StepCloseConfirmProps {
  creatorName: string;
  submissionName: string;
  ratings: CollaborationRatingsInput;
  portfolioFiles: PortfolioFile[];
}

export function StepCloseConfirm({
  creatorName,
  submissionName,
  ratings,
  portfolioFiles,
}: StepCloseConfirmProps) {
  const overallRating = calculateOverallRating(ratings);
  const config = RATING_CONFIG[overallRating] ?? RATING_CONFIG.untested;

  return (
    <div className="space-y-6">
      {portfolioFiles.length > 0 && (
        <div className="rounded-xl border border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Portfolio files added: </span>
          <span className="font-medium text-foreground">{portfolioFiles.length}</span>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground mb-1.5">
          Overall rating for {creatorName}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Calculated from the average of Visual Quality, Acting & Delivery, and Reliability & Speed.
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          After this collaboration this creator&apos;s rating will be:
        </p>
        <span
          className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full border capitalize ${config.className}`}
        >
          {overallRating}
        </span>
      </div>

      <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm space-y-1">
        <p className="font-medium text-foreground">Closing collaboration</p>
        <p className="text-muted-foreground">
          {creatorName} &middot; {submissionName}
        </p>
        <p className="text-xs text-muted-foreground pt-1">
          This will lock the folder. Admins will only be able to download assets after closing.
        </p>
      </div>
    </div>
  );
}
