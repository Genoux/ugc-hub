import type { PortfolioFile } from "../components/steps/step-portfolio";
import type { CollaborationRatingsInput } from "../schemas";

export function canProceedLogWizard(
  step: number,
  collabName: string,
  piecesOfContent: string,
  totalPaid: string,
  ratings: Partial<CollaborationRatingsInput>,
  showNameField = true,
  totalHighlights = 0,
): boolean {
  if (step === 1) {
    return (
      (!showNameField || collabName.trim().length > 0) &&
      parseInt(piecesOfContent, 10) > 0 &&
      !Number.isNaN(parseFloat(totalPaid)) &&
      parseFloat(totalPaid) >= 0
    );
  }
  if (step === 2) {
    return !!(ratings.visual_quality && ratings.acting_line_delivery && ratings.reliability_speed);
  }
  if (step === 3) {
    return totalHighlights > 0;
  }
  return true;
}

export function hasLogWizardChanges(
  collabName: string,
  piecesOfContent: string,
  totalPaid: string,
  notes: string,
  ratings: Partial<CollaborationRatingsInput>,
  portfolioFiles: PortfolioFile[],
): boolean {
  return (
    collabName.trim().length > 0 ||
    piecesOfContent !== "" ||
    totalPaid !== "" ||
    notes !== "" ||
    Object.keys(ratings).length > 0 ||
    portfolioFiles.length > 0
  );
}
