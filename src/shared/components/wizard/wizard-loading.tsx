"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";

interface WizardLoadingProps {
  title: string;
  description: string;
  progress?: number;
}

export function WizardLoading({ title, description, progress = 0 }: WizardLoadingProps) {
  return (
    <div className="flex w-full mx-auto max-w-md flex-col items-center gap-6 justify-center">
      <Loader2 className="size-8 animate-spin text-foreground" />
      <div className="flex w-full flex-col items-center gap-4 text-center">
        <div>
          <h2 className="text-2xl font-medium">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Progress className="h-1.5" value={progress} />
      </div>
    </div>
  );
}
