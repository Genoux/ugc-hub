'use client'

import { useState } from 'react'
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
      await submitWizard(token, stepOneData)
      setIsComplete(true)
      reset()
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-bold">Submission Complete!</h2>
        <p className="text-gray-600">Thank you for your submission. We'll review it shortly.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{campaignName}</h1>
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">Step {step} of 3</p>
      </div>

      {step === 1 && <WizardStepOne />}
      {step === 2 && <WizardStepTwo />}
      {step === 3 && <WizardStepThree onSubmit={handleSubmit} />}

      {isSubmitting && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Submitting...
        </div>
      )}
    </div>
  )
}
