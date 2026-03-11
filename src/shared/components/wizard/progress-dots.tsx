"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProgressDotsProps {
  current: number;
  steps: Record<number, { name: string }>;
  filledSteps: Set<number>;
  onStepClick: (step: number) => void;
  variant?: "default" | "dots";
  className?: string;
}

export function ProgressDots({
  className,
  current,
  steps,
  filledSteps,
  onStepClick,
  variant = "default",
}: ProgressDotsProps) {
  const stepEntries = Object.entries(steps).map(([key, val]) => ({
    step: Number(key),
    name: val.name,
  }));

  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center gap-1.5", className)}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={stepEntries.length}
        aria-label={steps[current]?.name}
      >
        {stepEntries.map(({ step }) => {
          const isCurrent = step === current;
          const isCompleted = step < current;
          return (
            <div
              key={step}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                isCurrent && "w-4 bg-foreground",
                isCompleted && "w-1.5 bg-foreground/40",
                !isCurrent && !isCompleted && "w-1.5 bg-muted-foreground/25",
              )}
            />
          );
        })}
      </div>
    );
  }

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
