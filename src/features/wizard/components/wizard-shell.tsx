'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useWizardState } from '../hooks/use-wizard-state'
import { WizardStepOne } from './wizard-step-one'
import { WizardStepTwo } from './wizard-step-two'
import { WizardStepThree } from './wizard-step-three'
import { submitWizard } from '../actions/submit-wizard'

export function WizardShell({ token, campaignName }: { token: string; campaignName: string }) {
  const { step, stepOneData, reset } = useWizardState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  async function handleSubmit() {
    if (!stepOneData) return

    setIsSubmitting(true)
    try {
      await submitWizard({
        token,
        creatorName: stepOneData.creatorName,
        creatorEmail: stepOneData.creatorEmail,
        creatorNotes: stepOneData.creatorNotes,
      })
      setIsComplete(true)
      reset()
    } catch (error) {
      console.error('Submission failed:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-16 text-green-600" />
          <div>
            <h2 className="text-2xl font-semibold">Submission Complete!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for your submission.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{campaignName}</h1>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s === step ? 'bg-primary' : s < step ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          {step === 1 && <WizardStepOne />}
          {step === 2 && <WizardStepTwo />}
          {step === 3 && <WizardStepThree onSubmit={handleSubmit} />}
        </div>

        {isSubmitting && (
          <p className="text-center text-sm text-muted-foreground">Submitting...</p>
        )}
      </div>
    </div>
  )
}
