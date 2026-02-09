"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useWizardState } from "../hooks/use-wizard-state";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export function WizardStepTwo() {
  const { setStepTwoFiles, setStep, stepTwoFiles } = useWizardState();
  const [files, setFiles] = useState<File[]>(stepTwoFiles);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function handleNext() {
    if (files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    setStepTwoFiles(files);
    setStep(3);
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center gap-2">
          <Upload className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Click to select files</p>
            <p className="text-xs text-muted-foreground">or drag and drop</p>
          </div>
        </label>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({files.length})</p>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg border p-2">
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={handleNext} className="flex-1">
          Next
        </Button>
      </div>
    </div>
  );
}
