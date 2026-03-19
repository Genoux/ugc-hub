import type { ExistingPortfolioHighlight, LogCollabInitialData } from "../types";
import type { PortfolioFile } from "../components/steps/step-portfolio";
import type { CollaborationRatingsInput } from "../schemas";
import type { CollaborationWizardMode } from "./collaboration-wizard-constants";

export type CollaborationWizardState = {
  ratings: Partial<CollaborationRatingsInput>;
  piecesOfContent: string;
  totalPaid: string;
  notes: string;
  portfolioFiles: PortfolioFile[];
  // log mode only; always [] in close mode
  collabName: string;
  existingHighlights: ExistingPortfolioHighlight[];
  showNameField: boolean;
};

export function canProceedStep(
  mode: CollaborationWizardMode,
  step: number,
  state: CollaborationWizardState,
): boolean {
  if (mode === "log") {
    if (step === 1) {
      return (
        (!state.showNameField || state.collabName.trim().length > 0) &&
        parseInt(state.piecesOfContent, 10) > 0 &&
        !Number.isNaN(parseFloat(state.totalPaid)) &&
        parseFloat(state.totalPaid) >= 0
      );
    }
    if (step === 2) {
      return !!(
        state.ratings.visual_quality &&
        state.ratings.acting_line_delivery &&
        state.ratings.reliability_speed
      );
    }
    if (step === 3) {
      const totalHighlights = state.existingHighlights.length + state.portfolioFiles.length;
      return totalHighlights > 0;
    }
    return true;
  }

  // close mode
  if (step === 1) {
    return !!(
      state.ratings.visual_quality &&
      state.ratings.acting_line_delivery &&
      state.ratings.reliability_speed
    );
  }
  if (step === 2) {
    return parseInt(state.piecesOfContent, 10) > 0 && parseFloat(state.totalPaid) >= 0;
  }
  if (step === 3) {
    return state.portfolioFiles.length > 0;
  }
  return true;
}

export function hasWizardChanges(
  mode: CollaborationWizardMode,
  state: CollaborationWizardState,
  initialData?: LogCollabInitialData,
): boolean {
  if (mode === "close") {
    return (
      Object.keys(state.ratings).length > 0 ||
      state.piecesOfContent !== "" ||
      state.totalPaid !== "" ||
      state.notes !== "" ||
      state.portfolioFiles.length > 0
    );
  }

  if (!initialData) {
    return (
      state.collabName.trim().length > 0 ||
      state.piecesOfContent !== "" ||
      state.totalPaid !== "" ||
      state.notes !== "" ||
      Object.keys(state.ratings).length > 0 ||
      state.portfolioFiles.length > 0
    );
  }

  const r = state.ratings as CollaborationRatingsInput;
  return (
    (state.showNameField && state.collabName !== initialData.name) ||
    state.piecesOfContent !== String(initialData.piecesOfContent) ||
    state.totalPaid !== String(initialData.totalPaidDollars) ||
    state.notes !== (initialData.notes ?? "") ||
    r.visual_quality !== initialData.ratings.visual_quality ||
    r.acting_line_delivery !== initialData.ratings.acting_line_delivery ||
    r.reliability_speed !== initialData.ratings.reliability_speed ||
    state.existingHighlights.length !== initialData.highlights.length ||
    state.portfolioFiles.length > 0
  );
}
