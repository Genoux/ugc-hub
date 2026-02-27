"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";

interface WizardStepLoadingProps {
  progress?: number;
}

export function WizardStepLoading({ progress = 0 }: WizardStepLoadingProps) {
  return (
    <div className="flex w-full mx-auto max-w-md flex-col items-center gap-4 justify-center">
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
      <div className="flex w-full flex-col items-center gap-4 text-center">
        <div>
          <h2 className="text-2xl font-medium">Submitting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploading your files, please don&apos;t close this page.
          </p>
        </div>
        <Progress className="h-1" value={progress} />
      </div>
    </div>
  );
}
