import { z } from "zod";

export const wizardStepTwoSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
      }),
    )
    .min(1)
    .max(50),
});

export type WizardStepTwo = z.infer<typeof wizardStepTwoSchema>;
