import { create } from "zustand";
import type { WizardStepOne } from "../schemas";

type FileData = {
  name: string;
  size: number;
  type: string;
};

type WizardState = {
  step: 1 | 2 | 3;
  stepOneData: WizardStepOne | null;
  stepTwoFiles: File[];
  setStep: (step: 1 | 2 | 3) => void;
  setStepOneData: (data: WizardStepOne) => void;
  setStepTwoFiles: (files: File[]) => void;
  reset: () => void;
};

export const useWizardState = create<WizardState>((set) => ({
  step: 1,
  stepOneData: null,
  stepTwoFiles: [],
  setStep: (step) => set({ step }),
  setStepOneData: (data) => set({ stepOneData: data }),
  setStepTwoFiles: (files) => set({ stepTwoFiles: files }),
  reset: () => set({ step: 1, stepOneData: null, stepTwoFiles: [] }),
}));
