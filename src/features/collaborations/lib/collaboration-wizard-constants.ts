export type CollaborationWizardMode = "log" | "close";

export const WIZARD_STEPS: Record<
  CollaborationWizardMode,
  Record<number, { header: string; body: string }>
> = {
  log: {
    1: {
      header: "Collaboration details",
      body: "Name this collaboration and record what was delivered and paid.",
    },
    2: { header: "Ratings", body: "Rate the quality of this collaboration." },
    3: { header: "Portfolio", body: "Optionally add standout pieces to the creator's portfolio." },
    4: { header: "Confirm", body: "Review and save this collaboration to the creator's profile." },
  },
  close: {
    1: { header: "Ratings", body: "Rate the quality of this collaboration." },
    2: { header: "Rates", body: "Content delivered and amount paid." },
    3: { header: "Portfolio", body: "Add standout pieces to the creator's portfolio." },
    4: { header: "Confirm & close", body: "Review and finalize the collaboration." },
  },
};
