"use client";

import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { useWizardState } from "../hooks/use-wizard-state";
import { FileList } from "./wizard-file-list";

interface WizardStepThreeProps {
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string | null;
  onSubmit: () => void;
}

export function WizardStepThree({
  creatorName,
  creatorEmail,
  creatorImageUrl,
  onSubmit,
}: WizardStepThreeProps) {
  const { stepTwoFiles, setStep } = useWizardState();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Submitting as</h3>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
            {creatorImageUrl ? (
              <Image src={creatorImageUrl} alt={creatorName} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-base font-medium text-muted-foreground">
                {creatorName[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{creatorName}</p>
            <p className="text-xs text-muted-foreground truncate">{creatorEmail}</p>
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
