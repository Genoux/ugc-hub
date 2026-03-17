"use client";

import { ArrowUpDown } from "lucide-react";
import { useEffect, useRef } from "react";
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

interface HeaderProps {
  count: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export function ApplicantListHeader({ count, sort, onSortChange }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-xs text-muted-foreground">
        {count} {count === 1 ? "applicant" : "applicants"}
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
    </div>
  );
}

interface Props {
  creators: Creator[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export function ApplicantList({ creators, selectedId, onSelect, onNavigate }: Props) {
  const selectedItemRef = useRef<HTMLLIElement | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevSelectedIdRef.current === selectedId) return;
    prevSelectedIdRef.current = selectedId;
    selectedItemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (creators.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      e.preventDefault();
      const idx = creators.findIndex((c) => c.id === selectedId);
      if (e.key === "ArrowDown") {
        const next = idx === -1 ? 0 : Math.min(idx + 1, creators.length - 1);
        (onNavigate ?? onSelect)(creators[next].id);
      } else {
        const prev = idx === -1 ? 0 : Math.max(idx - 1, 0);
        (onNavigate ?? onSelect)(creators[prev].id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [creators, selectedId, onSelect, onNavigate]);

  return (
    <ul className="space-y-0.5">
      {creators.map((c) => {
        const recent = isRecentlyApplied(c.appliedAt);
        const isSelected = selectedId === c.id;
        return (
          <li key={c.id} ref={isSelected ? selectedItemRef : undefined}>
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
  );
}
