'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useWizardState } from '../hooks/use-wizard-state'
import { WizardStepOne } from './wizard-step-one'
import { WizardStepTwo } from './wizard-step-two'
import { WizardStepThree } from './wizard-step-three'
import { submitWizard } from '../actions/submit-wizard'
import { useMultipartUpload } from '@/features/uploads/hooks/use-multipart-upload'

export function WizardShell({ token, campaignName }: { token: string; campaignName: string }) {
  const { step, stepOneData, stepTwoFiles, reset } = useWizardState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { uploads, uploadFile } = useMultipartUpload()

  async function handleSubmit() {
    if (!stepOneData) return

    setIsSubmitting(true)
    try {
      const submission = await submitWizard({
        token,
        creatorName: stepOneData.creatorName,
        creatorEmail: stepOneData.creatorEmail,
        creatorNotes: stepOneData.creatorNotes,
      })

      if (stepTwoFiles.length > 0) {
        await Promise.all(
          stepTwoFiles.map(file => uploadFile(file, submission.id))
        )
      }

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

  const uploadList = Object.values(uploads)
  const totalProgress = uploadList.length > 0
    ? Math.round(uploadList.reduce((sum, u) => sum + u.progress, 0) / uploadList.length)
    : 0

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
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              {uploadList.length > 0 ? 'Uploading files...' : 'Submitting...'}
            </p>
            {uploadList.length > 0 && (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {uploadList.map((upload, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{upload.filename}</span>
                      <span>{upload.progress}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
