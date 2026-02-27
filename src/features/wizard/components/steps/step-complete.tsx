"use client";

import { Button } from "@/shared/components/ui/button";

export function WizardStepComplete() {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-col gap-3">
        <h1 id="wizard-title" className="text-4xl font-medium">
          Submission complete!
        </h1>
        <p className="text-muted-foreground text-sm">Your files have been received.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" asChild>
          <a href="/creator">Go to my profile</a>
        </Button>
      </div>
    </div>
  );
}
