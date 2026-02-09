'use client'

import { useState } from 'react'
import { useWizardState } from '../hooks/use-wizard-state'
import type { WizardStepOne } from '../schemas'

export function WizardStepOne() {
  const { setStepOneData, setStep } = useWizardState()
  const [formData, setFormData] = useState<WizardStepOne>({
    creatorName: '',
    creatorEmail: '',
    creatorNotes: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStepOneData(formData)
    setStep(2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Your Information</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.creatorName}
          onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.creatorEmail}
          onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.creatorNotes}
          onChange={(e) => setFormData({ ...formData, creatorNotes: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Next
      </button>
    </form>
  )
}
