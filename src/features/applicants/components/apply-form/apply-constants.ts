export const APPLY_STEPS: Record<number, { name: string; header: string; body: string }> = {
  1: {
    name: "Identity",
    header: "Who are you?",
    body: "Let's start with your full name",
  },
  2: {
    name: "Location",
    header: "Where are you from?",
    body: "Where are you based and what languages do you create in?",
  },
  3: {
    name: "Socials",
    header: "Your platforms",
    body: "Share your social channels and/or portfolio link.",
  },
  4: {
    name: "Email",
    header: "Last step",
    body: "What email address can we reach you at?",
  },
};

export const TOTAL_APPLY_STEPS = 5; // step 5 is the result step
