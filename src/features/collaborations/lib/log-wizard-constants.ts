export const LOG_WIZARD_STEPS: Record<number, { name: string; header: string; body: string }> = {
  1: {
    name: "Details",
    header: "Collaboration details",
    body: "Name this collaboration and record what was delivered and paid.",
  },
  2: {
    name: "Ratings",
    header: "Ratings",
    body: "Rate the quality of this collaboration.",
  },
  3: {
    name: "Portfolio",
    header: "Portfolio",
    body: "Optionally add standout pieces to the creator's portfolio.",
  },
  4: {
    name: "Confirm",
    header: "Confirm",
    body: "Review and save this collaboration to the creator's profile.",
  },
};
