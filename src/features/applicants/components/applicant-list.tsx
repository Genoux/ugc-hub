"use client";

import { ArrowUpDown } from "lucide-react";
import type { Creator, SortKey } from "@/features/applicants/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name A→Z",
};

const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isRecentlyApplied(appliedAt: Date | string) {
  return Date.now() - new Date(appliedAt).getTime() < NEW_THRESHOLD_MS;
}

interface Props {
  creators: Creator[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export function ApplicantList({ creators, selectedId, onSelect, sort, onSortChange }: Props) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between mb-3 px-1 py-1">
        <span className="text-xs text-muted-foreground">
          {creators.length} {creators.length === 1 ? "applicant" : "applicants"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground px-2"
            >
              <ArrowUpDown className="h-3 w-3" />
              {SORT_LABELS[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onSortChange(key)}
                className={sort === key ? "font-medium" : ""}
              >
                {SORT_LABELS[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="pointer-events-none absolute inset-x-0 top-full h-6 bg-linear-to-b from-background to-transparent" />
      </div>

      <ul className="space-y-0.5">
        {creators.map((c) => {
          const recent = isRecentlyApplied(c.appliedAt);
          return (
            <li key={c.id}>
              <Button
                variant="ghost"
                onClick={() => onSelect(c.id)}
                className={cn(
                  "w-full justify-start text-left px-3 py-3 h-auto font-normal rounded-lg flex items-center gap-3",
                  selectedId === c.id ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {c.fullName || c.email}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {new Date(c.appliedAt).toLocaleDateString(undefined, {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      {new Date(c.appliedAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </span>
                  </div>
                  {recent && <Badge variant="outline">New</Badge>}
                </div>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
