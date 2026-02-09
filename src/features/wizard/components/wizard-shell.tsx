'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useWizardState } from '../hooks/use-wizard-state'
import { WizardStepOne } from './wizard-step-one'
import { WizardStepTwo } from './wizard-step-two'
import { WizardStepThree } from './wizard-step-three'
import { submitWizard } from '../actions/submit-wizard'
import { Card, CardContent } from '@/shared/components/ui/card'

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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle2 className="size-16 text-green-600" />
            <div>
              <h2 className="text-2xl font-semibold">Submission Complete!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for your submission.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{campaignName}</h1>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s === step ? 'bg-primary' : s < step ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 1 && <WizardStepOne />}
            {step === 2 && <WizardStepTwo />}
            {step === 3 && <WizardStepThree onSubmit={handleSubmit} />}
          </CardContent>
        </Card>

        {isSubmitting && (
          <p className="text-center text-sm text-muted-foreground">Submitting...</p>
        )}
      </div>
    </div>
  )
}
