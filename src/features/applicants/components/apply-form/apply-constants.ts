export const APPLY_STEPS: Record<number, { name: string; header: string; body: string }> = {
  1: {
    name: "Identity",
    header: "Who are you?",
    body: "Tell us your name.",
  },
  2: {
    name: "Location",
    header: "Where are you from?",
    body: "Tell us where you're based and what languages you create in.",
  },
  3: {
    name: "Socials",
    header: "Show your work",
    body: "Share your social channels and portfolio link.",
  },
  4: {
    name: "Email",
    header: "Last step",
    body: "Where should we send your application confirmation?",
  },
};

export const TOTAL_APPLY_STEPS = 5; // step 5 is the result step
