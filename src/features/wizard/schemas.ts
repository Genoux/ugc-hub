import { z } from 'zod'

export const wizardStepOneSchema = z.object({
  creatorName: z.string().min(1).max(100),
  creatorEmail: z.string().email(),
  creatorNotes: z.string().max(1000).optional(),
})

export const wizardStepTwoSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  })).min(1).max(50),
})

export type WizardStepOne = z.infer<typeof wizardStepOneSchema>
export type WizardStepTwo = z.infer<typeof wizardStepTwoSchema>
