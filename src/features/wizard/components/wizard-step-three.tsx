'use client'

import { useWizardState } from '../hooks/use-wizard-state'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

export function WizardStepThree({ onSubmit }: { onSubmit: () => void }) {
  const { stepOneData, stepTwoData, setStep } = useWizardState()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{stepOneData?.creatorName}</span>
          </div>
          <Separator />
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{stepOneData?.creatorEmail}</span>
          </div>
          {stepOneData?.creatorNotes && (
            <>
              <Separator />
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Notes</span>
                <span className="text-sm">{stepOneData.creatorNotes}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{stepTwoData?.files.length || 0} file(s) selected</p>
        </CardContent>
      </Card>

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
