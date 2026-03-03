"use client";

import { Slot } from "@radix-ui/react-slot";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/shared/lib/utils";

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("CollapsibleTrigger/Content must be used within CollapsibleSection");
  }
  return context;
}

interface CollapsibleSectionProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((o) => !o);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function CollapsibleTrigger({ children, asChild }: CollapsibleTriggerProps) {
  const { toggle } = useCollapsible();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp type={asChild ? undefined : "button"} onClick={toggle}>
      {children}
    </Comp>
  );
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const { open } = useCollapsible();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className={cn("border-t border-border overflow-hidden", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { useCollapsible };
