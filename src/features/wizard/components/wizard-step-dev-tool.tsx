"use client";

const STEP_LABELS: Record<number, string> = {
  1: "Submitting",
  2: "Upload",
  3: "Loading",
  4: "Complete",
};

interface WizardStepDevToolProps {
  currentStep: number;
  onGoToStep: (step: number) => void;
}

export function WizardStepDevTool({ currentStep, onGoToStep }: WizardStepDevToolProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-9999 flex flex-col gap-1 rounded-lg border border-border/80 bg-background/95 p-2 shadow-lg backdrop-blur"
      role="toolbar"
      aria-label="Wizard step dev navigation"
    >
      <span className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Dev: Steps</span>
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onGoToStep(s)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              s === currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            title={`Go to step ${s}: ${STEP_LABELS[s]}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
