"use client";

import { Button } from "@/shared/components/ui/button";
import { useWizardState } from "../hooks/use-wizard-state";
import { FileList } from "./wizard-file-list";

export function WizardStepThree({ onSubmit }: { onSubmit: () => void }) {
  const { stepOneData, stepTwoFiles, setStep } = useWizardState();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Your Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{stepOneData?.creatorName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{stepOneData?.creatorEmail}</span>
          </div>
        </div>
      </div>

      <FileList files={stepTwoFiles} />

      <div className="flex gap-2">
        <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={onSubmit} className="flex-1">
          Submit
        </Button>
      </div>
    </div>
  );
}
