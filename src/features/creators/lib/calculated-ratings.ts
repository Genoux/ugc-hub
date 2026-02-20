import { calculateOverallRating } from "@/features/collaborations/lib/calculate-overall-rating";
import type { RatingTier } from "@/features/creators/constants";
import type { ClosedCollaboration } from "../actions/admin/get-creator-profile-assets";
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

export type CalculatedRatingsResult = {
  overall: OverallRatingTier;
  visual_quality: RatingTier;
  acting_line_delivery: RatingTier;
  reliability_speed: RatingTier;
};

export function calculateRatingsFromCollaborations(
  collabs: ClosedCollaboration[],
): CalculatedRatingsResult | null {
  const rated = collabs.filter(
    (c) => c.ratingVisualQuality && c.ratingActingDelivery && c.ratingReliabilitySpeed,
  );
  if (!rated.length) return null;

  const n = rated.length;
  const sumV = rated.reduce((s, c) => s + (SCORE[c.ratingVisualQuality!] ?? 0), 0);
  const sumA = rated.reduce((s, c) => s + (SCORE[c.ratingActingDelivery!] ?? 0), 0);
  const sumR = rated.reduce((s, c) => s + (SCORE[c.ratingReliabilitySpeed!] ?? 0), 0);

  const visual_quality = scoreToTier(sumV / n);
  const acting_line_delivery = scoreToTier(sumA / n);
  const reliability_speed = scoreToTier(sumR / n);

  return {
    overall: calculateOverallRating({ visual_quality, acting_line_delivery, reliability_speed }),
    visual_quality,
    acting_line_delivery,
    reliability_speed,
  };
}
