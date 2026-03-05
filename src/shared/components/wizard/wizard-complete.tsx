"use client";

import type { ReactNode } from "react";

interface WizardCompleteProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function WizardComplete({ title, description, children }: WizardCompleteProps) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-col gap-3">
        <h1 id="wizard-title" className="text-4xl font-medium">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}
