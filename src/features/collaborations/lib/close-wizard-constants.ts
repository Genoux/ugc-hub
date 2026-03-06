export const CLOSE_WIZARD_STEPS: Record<number, { name: string; header: string; body: string }> = {
  1: {
    name: "Ratings",
    header: "Ratings",
    body: "Rate the quality of this collaboration.",
  },
  2: {
    name: "Rates",
    header: "Rates",
    body: "Content delivered and amount paid.",
  },
  3: {
    name: "Portfolio",
    header: "Portfolio",
    body: "Add standout pieces to the creator's portfolio.",
  },
  4: {
    name: "Confirm",
    header: "Confirm & close",
    body: "Review and finalize the collaboration.",
  },
};
