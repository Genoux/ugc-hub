"use client";

import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useWizardState } from "../hooks/use-wizard-state";

export function WizardStepTwo() {
  const { setStepTwoFiles, setStep, stepTwoFiles } = useWizardState();
  const [files, setFiles] = useState<File[]>(stepTwoFiles);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Selected Files ({files.length})</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-more"
            />
          </div>
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate block">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFile(idx)}>
                <X className="size-4" />
              </Button>
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
