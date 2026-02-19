"use client";

import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { useWizardState } from "../hooks/use-wizard-state";

interface WizardStepOneProps {
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string | null;
}

export function WizardStepOne({ creatorName, creatorEmail, creatorImageUrl }: WizardStepOneProps) {
  const { setStep } = useWizardState();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Submitting as</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your assets will be linked to this account.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-muted/40 px-4 py-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {creatorImageUrl ? (
            <Image src={creatorImageUrl} alt={creatorName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
              {creatorName[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{creatorName}</p>
          <p className="text-sm text-muted-foreground truncate">{creatorEmail}</p>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={() => setStep(2)}>
        Continue
      </Button>
    </div>
  );
}
