"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDropZone } from "@/shared/components/file-drop-zone";
import { Button } from "@/shared/components/ui/button";
import { useWizardState } from "../hooks/use-wizard-state";
import { FileList } from "./wizard-file-list";

export function WizardStepTwo() {
  const { setStepTwoFiles, setStep, stepTwoFiles } = useWizardState();
  const [files, setFiles] = useState<File[]>(stepTwoFiles);

  function handleInvalidFiles(rejected: { names: string[]; reason: "type" | "size" }) {
    if (rejected.reason === "type") toast.error("File type not supported");
    else toast.error("File too large (max 500MB)");
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
      <FileDropZone
        onFilesAdd={(added) => setFiles((prev) => [...prev, ...added])}
        onInvalidFiles={handleInvalidFiles}
        hint="MP4, MOV, images up to 500MB each"
      />

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
