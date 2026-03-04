"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProgressDotsProps {
  current: number;
  steps: Record<number, { name: string }>;
  filledSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function ProgressDots({ current, steps, filledSteps, onStepClick }: ProgressDotsProps) {
  const stepEntries = Object.entries(steps).map(([key, val]) => ({
    step: Number(key),
    name: val.name,
  }));

  return (
    <div
      className="flex items-center gap-1 flex-wrap justify-center"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={stepEntries.length}
      aria-label={steps[current]?.name}
    >
      {stepEntries.map(({ step, name }) => {
        const isCompleted = step < current;
        const isCurrent = step === current;
        return (
          <Button
            key={step}
            variant="outline"
            size="sm"
            onClick={() => onStepClick(step)}
            className={cn(
              "text-xs transition-colors disabled:cursor-default relative",
              isCompleted && "text-foreground",
              isCurrent && "text-foreground font-medium opacity-100",
            )}
            aria-label={isCompleted ? `Go back to ${name}` : name}
          >
            {!filledSteps.has(step) ? (
              <CircleAlert className="size-3.5 rounded-full animate-pulse text-red-500 bg-white absolute -top-1 -right-1" />
            ) : null}
            <span className={cn(!isCurrent && "opacity-50")}>{name}</span>
          </Button>
        );
      })}
    </div>
  );
}
