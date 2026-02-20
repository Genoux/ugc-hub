import { create } from "zustand";

type WizardState = {
  step: 1 | 2 | 3;
  stepTwoFiles: File[];
  setStep: (step: 1 | 2 | 3) => void;
  setStepTwoFiles: (files: File[]) => void;
  reset: () => void;
};

export const useWizardState = create<WizardState>((set) => ({
  step: 1,
  stepTwoFiles: [],
  setStep: (step) => set({ step }),
  setStepTwoFiles: (files) => set({ stepTwoFiles: files }),
  reset: () => set({ step: 1, stepTwoFiles: [] }),
}));
