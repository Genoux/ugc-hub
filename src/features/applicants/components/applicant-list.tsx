"use client";

import type { Creator } from "@/features/applicants/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface Props {
  creators: Creator[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ApplicantList({ creators, selectedId, onSelect }: Props) {
  if (creators.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        No applicants here yet.
      </div>
    );
  }

  return (
    <ul className="overflow-y-auto max-h-[calc(100vh-220px)] space-y-0.5">
      {creators.map((c) => (
        <li key={c.id}>
          <Button
            variant="ghost"
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full justify-start text-left px-3 py-3 h-auto font-normal rounded-lg flex items-center gap-3",
              selectedId === c.id ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground block truncate">
                {c.fullName || c.email}
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Applied {new Date(c.appliedAt).toLocaleDateString()}
              </span>
            </div>
          </Button>
        </li>
      ))}
    </ul>
  );
}
