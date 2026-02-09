'use client'

import { useWizardState } from '../hooks/use-wizard-state'

export function WizardStepThree({ onSubmit }: { onSubmit: () => void }) {
  const { stepOneData, stepTwoData, setStep } = useWizardState()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Review & Submit</h2>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Your Information</h3>
        <p><strong>Name:</strong> {stepOneData?.creatorName}</p>
        <p><strong>Email:</strong> {stepOneData?.creatorEmail}</p>
        {stepOneData?.creatorNotes && (
          <p><strong>Notes:</strong> {stepOneData.creatorNotes}</p>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Files</h3>
        <p>{stepTwoData?.files.length || 0} file(s) selected</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
