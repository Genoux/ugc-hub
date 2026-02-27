"use client";

import { Button } from "@/shared/components/ui/button";

interface Props {
  error: string | null;
  onExit: () => void;
  onRetry: () => void;
}

export function StepComplete({ error, onExit, onRetry }: Props) {
  if (error) {
    return (
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-col gap-2">
          <h1 id="wizard-title" className="text-2xl font-medium">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
          <Button type="button" onClick={onExit}>
            Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-12">
      <div className="flex flex-col gap-4">
        <h1 id="wizard-title" className="text-4xl font-medium">
          You're all set!
        </h1>
        <p className="text-muted-foreground text-sm">Your profile is complete and discoverable.</p>
      </div>
      <Button type="button" onClick={onExit}>
        Go to dashboard
      </Button>
    </div>
  );
}
