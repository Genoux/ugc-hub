'use client'

import { useWizardState } from '../hooks/use-wizard-state'
import { Button } from '@/shared/components/ui/button'

export function WizardStepThree({ onSubmit }: { onSubmit: () => void }) {
  const { stepOneData, stepTwoData, setStep } = useWizardState()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Your Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{' '}
            <span className="font-medium">{stepOneData?.creatorName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{' '}
            <span className="font-medium">{stepOneData?.creatorEmail}</span>
          </div>
          {stepOneData?.creatorNotes && (
            <div>
              <span className="text-muted-foreground">Notes:</span>{' '}
              <span>{stepOneData.creatorNotes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Files</h3>
        <p className="text-sm">{stepTwoData?.files.length || 0} file(s) selected</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setStep(2)}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1"
        >
          Submit
        </Button>
      </div>
    </div>
  )
}
