import type { OverallRatingTier } from "@/features/creators/constants";
import { OVERALL_RATING_TIERS } from "@/features/creators/constants";
import type { CollaborationRatingsInput } from "../schemas";

const SCORE: Record<string, number> = {
  standout: 4,
  good: 3,
  sufficient: 2,
  problematic: 1,
  untested: 0,
};

/**
 * Overall rating is derived from the average of the three collaboration dimensions.
 * "Top creator" when all three are standout; otherwise map average score to tier.
 */
export function calculateOverallRating(ratings: CollaborationRatingsInput): OverallRatingTier {
  const a = SCORE[ratings.visual_quality] ?? 0;
  const b = SCORE[ratings.acting_line_delivery] ?? 0;
  const c = SCORE[ratings.reliability_speed] ?? 0;
  const avg = (a + b + c) / 3;

  if (a === 4 && b === 4 && c === 4) return "top creator";
  if (avg >= 3.5) return "standout";
  if (avg >= 2.5) return "good";
  if (avg >= 1.5) return "sufficient";
  if (avg >= 0.5) return "problematic";
  return "untested";
}

export function isOverallRatingTier(value: string): value is OverallRatingTier {
  return OVERALL_RATING_TIERS.includes(value as OverallRatingTier);
}
