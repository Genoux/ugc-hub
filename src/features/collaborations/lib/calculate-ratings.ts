import type { OverallRatingTier, RatingTier } from "@/features/creators/constants";

export const SCORE: Record<string, number> = {
  standout: 4,
  good: 3,
  sufficient: 2,
  problematic: 1,
};

const MAX_SCORE = Math.max(...Object.values(SCORE));

export type RatingDimensions = {
  visual_quality: RatingTier;
  acting_line_delivery: RatingTier;
  reliability_speed: RatingTier;
};

export type CollabRatingRow = {
  ratingVisualQuality: string | null;
  ratingActingDelivery: string | null;
  ratingReliabilitySpeed: string | null;
};

function scoreToTier(avg: number): RatingTier {
  if (avg >= 3.5) return "standout";
  if (avg >= 2.5) return "good";
  if (avg >= 1.5) return "sufficient";
  if (avg >= 0.5) return "problematic";
  return "untested";
}

function avgDimensionScores(values: (string | null)[]): RatingTier {
  const rated = values.filter((v): v is string => v !== null && v !== "untested" && v in SCORE);
  if (rated.length === 0) return "untested";
  return scoreToTier(rated.reduce((s, v) => s + SCORE[v], 0) / rated.length);
}

/**
 * Calculates the overall rating for a single collaboration from its three dimensions.
 * Untested dimensions are excluded from the average rather than scored as 0.
 * "Top creator" requires all three dimensions to be standout.
 */
export function calculateOverallRating(ratings: RatingDimensions): OverallRatingTier {
  const { visual_quality, acting_line_delivery, reliability_speed } = ratings;

  const dimensions = [visual_quality, acting_line_delivery, reliability_speed];
  if (dimensions.every((d) => SCORE[d] === MAX_SCORE)) {
    return "top creator";
  }

  const avg = avgDimensionScores([visual_quality, acting_line_delivery, reliability_speed]);
  return avg === "untested" ? "untested" : avg;
}

/**
 * Calculates the creator's overall rating from a list of collaborations.
 * To project with a pending collab, spread it in: calculateCreatorRating([...existing, pendingRow])
 */
export function calculateCreatorRating(collabs: CollabRatingRow[]): OverallRatingTier {
  if (collabs.length === 0) return "untested";
  return calculateOverallRating({
    visual_quality: avgDimensionScores(collabs.map((c) => c.ratingVisualQuality)),
    acting_line_delivery: avgDimensionScores(collabs.map((c) => c.ratingActingDelivery)),
    reliability_speed: avgDimensionScores(collabs.map((c) => c.ratingReliabilitySpeed)),
  });
}
