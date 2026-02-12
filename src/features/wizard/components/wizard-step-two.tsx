"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useWizardState } from "../hooks/use-wizard-state";
import { FileList } from "./wizard-file-list";

export function WizardStepTwo() {
  const { setStepTwoFiles, setStep, stepTwoFiles } = useWizardState();
  const [files, setFiles] = useState<File[]>(stepTwoFiles);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      for (const file of newFiles) {
        if (!(UPLOAD_CONFIG.allowedMimeTypes as readonly string[]).includes(file.type)) {
          invalidFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      }

      if (invalidFiles.length > 0) {
        toast.error("File type not supported");
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleNext() {
    if (files.length === 0) {
      toast.error("Please select at least one file");
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

      {files.length > 0 && <FileList files={files} onRemove={handleRemoveFile} />}

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
