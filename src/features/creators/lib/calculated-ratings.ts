import { calculateOverallRating } from "@/features/collaborations/lib/calculate-overall-rating";
import type { RatingTier } from "@/features/creators/constants";
import type { OverallRatingTier } from "../constants";

const SCORE: Record<string, number> = {
  standout: 4,
  good: 3,
  sufficient: 2,
  problematic: 1,
  untested: 0,
};

function scoreToTier(avg: number): RatingTier {
  if (avg >= 3.5) return "standout";
  if (avg >= 2.5) return "good";
  if (avg >= 1.5) return "sufficient";
  if (avg >= 0.5) return "problematic";
  return "untested";
}

export type CollaborationRatingItem = {
  ratings: {
    visual_quality: string;
    acting_line_delivery: string;
    reliability_speed: string;
  };
};

export type CalculatedRatingsResult = {
  overall: OverallRatingTier;
  visual_quality: RatingTier;
  acting_line_delivery: RatingTier;
  reliability_speed: RatingTier;
};

/**
 * Average each dimension across all collaborations, map to tier; overall from same formula as single collab.
 */
export function calculateRatingsFromCollaborations(
  collaborations: CollaborationRatingItem[],
): CalculatedRatingsResult | null {
  if (!collaborations?.length) return null;

  const n = collaborations.length;
  let sumV = 0;
  let sumA = 0;
  let sumR = 0;

  for (const c of collaborations) {
    const r = c.ratings;
    if (r) {
      sumV += SCORE[r.visual_quality] ?? 0;
      sumA += SCORE[r.acting_line_delivery] ?? 0;
      sumR += SCORE[r.reliability_speed] ?? 0;
    }
  }

  const visual_quality = scoreToTier(sumV / n);
  const acting_line_delivery = scoreToTier(sumA / n);
  const reliability_speed = scoreToTier(sumR / n);

  const overall = calculateOverallRating({
    visual_quality,
    acting_line_delivery,
    reliability_speed,
  });

  return {
    overall,
    visual_quality,
    acting_line_delivery,
    reliability_speed,
  };
}
