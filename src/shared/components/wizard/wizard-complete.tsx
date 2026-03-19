"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface WizardCompleteProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function WizardComplete({ title, description, children, className }: WizardCompleteProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-3 items-center">
        <h1 id="wizard-title" className="text-4xl font-medium">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm text-center">{description}</p>
      </div>
      {children}
    </div>
  );
}
