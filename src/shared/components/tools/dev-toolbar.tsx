"use client";

import { BugIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface DevTool {
  label: string;
  action: () => void | Promise<void>;
}

interface DevToolbarProps {
  tools: DevTool[];
  context?: string;
}

/**
 * Floating dev toolbar — only renders in development.
 * Drop it anywhere and pass context-specific tools as props.
 */
export function DevToolbar({ tools, context }: DevToolbarProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return <DevToolbarInner tools={tools} context={context} />;
}

function DevToolbarInner({ tools, context }: DevToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [x, setX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragOffsetX = useRef(0);
  const isPressing = useRef(false);
  const hasDragged = useRef(false);

  useEffect(() => {
    if (containerRef.current) setX(window.innerWidth - containerRef.current.offsetWidth - 16);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isPressing.current) return;
      hasDragged.current = true;
      const next = e.clientX - dragOffsetX.current;
      const maxX = containerRef.current
        ? window.innerWidth - containerRef.current.offsetWidth
        : window.innerWidth;
      setX(Math.max(0, Math.min(next, maxX)));
    };

    const onUp = () => {
      if (!isPressing.current) return;
      isPressing.current = false;
      if (!hasDragged.current) setDropdownOpen((v) => !v);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    isPressing.current = true;
    hasDragged.current = false;
    dragOffsetX.current = e.clientX - containerRef.current.getBoundingClientRect().left;
  };

  // Radix fires onOpenChange on pointerdown — suppress while pressing so we
  // own the open/close decision entirely from onPointerUp.
  const handleOpenChange = (next: boolean) => {
    if (isPressing.current) return;
    setDropdownOpen(next);
  };

  const run = async (tool: DevTool) => {
    setPending(tool.label);
    try {
      await tool.action();
    } finally {
      setPending(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 left-[50%] translate-x-[-50%] mx-auto z-9998"
      style={x !== null ? { left: x } : { right: 16 }}
    >
      <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          ref={triggerRef}
          onPointerDown={onPointerDown}
          className="flex h-10 w-10 justify-center items-center cursor-grab rounded-full border bg-background/95 p-2 text-xs font-mono font-medium text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground active:cursor-grabbing select-none outline-none"
          aria-label="Toggle dev toolbar"
        >
          <BugIcon className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          onPointerDownOutside={(e) => {
            // Prevent Radix's DismissableLayer from closing on trigger press —
            // we handle close ourselves in onPointerUp.
            if (triggerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          {context && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {context}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {tools.map((tool) => (
            <DropdownMenuItem
              key={tool.label}
              disabled={pending === tool.label}
              onSelect={() => run(tool)}
            >
              {pending === tool.label ? "Running…" : tool.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
