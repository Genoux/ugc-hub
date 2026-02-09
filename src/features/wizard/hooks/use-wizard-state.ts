import { create } from 'zustand'
import type { WizardStepOne, WizardStepTwo } from '../schemas'

type WizardState = {
  step: number
  stepOneData: WizardStepOne | null
  stepTwoData: WizardStepTwo | null
  setStep: (step: number) => void
  setStepOneData: (data: WizardStepOne) => void
  setStepTwoData: (data: WizardStepTwo) => void
  reset: () => void
}

export const useWizardState = create<WizardState>((set) => ({
  step: 1,
  stepOneData: null,
  stepTwoData: null,
  setStep: (step) => set({ step }),
  setStepOneData: (data) => set({ stepOneData: data }),
  setStepTwoData: (data) => set({ stepTwoData: data }),
  reset: () => set({ step: 1, stepOneData: null, stepTwoData: null }),
}))
