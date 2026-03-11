"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { EASING_FUNCTION } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

const SLIDE_OFFSET = 12;

// --- Wizard (outer shell) ---

type WizardProps = {
  variant: "modal" | "page";
  children: ReactNode;
  className?: string;
};

export function Wizard({ variant, children, className }: WizardProps) {
  const isModal = variant === "modal";

  if (isModal) {
    return (
      <motion.div
        className={cn(
          "fixed inset-0 flex min-h-[max(600px,100vh)] flex-col overflow-auto z-50 min-w-[368px]",
          className,
        )}
        initial={{ opacity: 0, y: 250 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 250 }}
        transition={{
          ease: EASING_FUNCTION.exponential,
          opacity: { duration: 0.2, ease: EASING_FUNCTION.quartic },
          y: { duration: 0.5, ease: EASING_FUNCTION.exponential },
        }}
        role="dialog"
        aria-modal
        aria-labelledby="wizard-title"
      >
        <div className="flex min-h-0 flex-1 overflow-hidden bg-cream p-4">{children}</div>
      </motion.div>
    );
  }

  return (
    <div className={cn("flex min-h-screen flex-col overflow-auto", className)}>
      <div className="flex min-h-0 flex-1 overflow-hidden bg-cream p-4">{children}</div>
    </div>
  );
}

// --- WizardPanel (white card) ---

type WizardPanelProps = {
  isPending?: boolean;
  children: ReactNode;
  className?: string;
};

export function WizardPanel({ isPending = false, children, className }: WizardPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-4xl bg-white shadow-hub",
        className,
      )}
    >
      <div className="relative flex h-full w-full flex-col">
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-center transition-opacity duration-200",
            isPending && "opacity-40 pointer-events-none select-none",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// --- WizardHeader ---

type WizardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function WizardHeader({ children, className }: WizardHeaderProps) {
  return (
    <div className={cn("flex shrink-0 items-center justify-between w-full px-8 pt-8", className)}>
      {children}
    </div>
  );
}

// --- WizardStep (animated per-step content area) ---

type WizardStepProps = {
  stepKey: number | string;
  direction: 1 | -1;
  children: ReactNode;
  className?: string;
};

export function WizardStep({ stepKey, direction, children, className }: WizardStepProps) {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto overflow-y-auto px-6 flex-1 min-h-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: direction * SLIDE_OFFSET }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -SLIDE_OFFSET }}
          transition={{ duration: 0.3, ease: EASING_FUNCTION.exponential }}
          className={cn("mx-auto flex min-h-full w-full max-w-3xl flex-col", className)}
        >
          <div className="flex flex-1 flex-col justify-center gap-6">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- WizardTitle ---

type WizardTitleProps = React.ComponentProps<"h1">;

export function WizardTitle({ className, children, ...props }: WizardTitleProps) {
  return (
    <h1 id="wizard-title" className={cn("text-4xl font-medium", className)} {...props}>
      {children}
    </h1>
  );
}

// --- WizardDescription ---

type WizardDescriptionProps = React.ComponentProps<"p">;

export function WizardDescription({ className, children, ...props }: WizardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

// --- WizardFooter ---

type WizardFooterProps = React.ComponentProps<"div">;

export function WizardFooter({ className, children, ...props }: WizardFooterProps) {
  return (
    <div
      className={cn("flex w-full shrink-0 items-center justify-between gap-4 py-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// --- WizardAside ---

type WizardAsideProps = {
  stepKey: number | string;
  direction: 1 | -1;
  visible?: boolean;
  children: ReactNode;
  className?: string;
};

export function WizardAside({
  stepKey,
  direction,
  visible = true,
  children,
  className,
}: WizardAsideProps) {
  return (
    <motion.aside
      animate={
        visible
          ? { opacity: 1 }
          : { width: 0, minWidth: 0, opacity: 0, x: SLIDE_OFFSET, paddingLeft: 0 }
      }
      transition={{ duration: 0.2, ease: EASING_FUNCTION.exponential }}
      className={cn(
        "hidden xl:flex shrink-0 overflow-hidden w-[min(536px,40vw)] min-w-[280px] pl-4",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: direction * 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -10 }}
          transition={{ duration: 0.2, ease: EASING_FUNCTION.exponential }}
          className="relative h-full w-full overflow-hidden rounded-4xl shadow-hub"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  );
}
