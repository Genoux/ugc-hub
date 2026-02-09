'use client'

import { useState } from 'react'
import { useWizardState } from '../hooks/use-wizard-state'

export function WizardStepTwo() {
  const { setStepTwoData, setStep } = useWizardState()
  const [files, setFiles] = useState<File[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  function handleNext() {
    if (files.length === 0) {
      alert('Please select at least one file')
      return
    }

    setStepTwoData({
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    })
    setStep(3)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upload Files</h2>

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-700"
        >
          Click to select files
        </label>
        <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files ({files.length})</h3>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between rounded border p-2">
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
