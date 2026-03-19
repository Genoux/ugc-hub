import type { CollaborationRatingsInput } from "./schemas";

export type ExistingPortfolioHighlight = {
  id: string;
  r2Key: string;
  filename: string;
  url: string;
};

export type LogCollabInitialData = {
  collaborationId: string;
  name: string;
  projectId: string | null;
  ratings: CollaborationRatingsInput;
  piecesOfContent: number;
  totalPaidDollars: number;
  notes: string | null;
  highlights: ExistingPortfolioHighlight[];
};
