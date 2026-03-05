import type { PortfolioFile } from "../components/steps/step-portfolio";
import type { CollaborationRatingsInput } from "../schemas";

export function canProceed(
  step: number,
  ratings: Partial<CollaborationRatingsInput>,
  piecesOfContent: string,
  totalPaid: string,
  portfolioFiles: PortfolioFile[],
): boolean {
  if (step === 1) {
    return !!(ratings.visual_quality && ratings.acting_line_delivery && ratings.reliability_speed);
  }
  if (step === 2) {
    return parseInt(piecesOfContent, 10) > 0 && parseFloat(totalPaid) >= 0;
  }
  if (step === 3) {
    return portfolioFiles.length > 0;
  }
  return true;
}
