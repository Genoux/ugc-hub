"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { StatusBadge } from "@/shared/components/status-badge";
import { Button } from "@/shared/components/ui/button";

type Collaboration = CreatorSubmissions[number];

interface ContentProjectsProps {
  collaboration: Collaboration;
  onClick: () => void;
}

export function ContentProjects({ collaboration, onClick }: ContentProjectsProps) {
  const totalFiles = collaboration.submissions.reduce((s, sub) => s + sub.assets.length, 0);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-border px-6 py-10 hover:bg-accent/40 transition-colors text-left group"
    >
      <div className="flex flex-col">
        <h1 className="text-lg font-medium">{collaboration.projectName}</h1>
        <div className="flex items-center gap-1">
          <p className="text-xs text-muted-foreground">
            {collaboration.submissions.length} submission
            {collaboration.submissions.length !== 1 ? "s" : ""}
          </p>
          ·
          <p className="text-xs text-muted-foreground">
            {totalFiles} piece{totalFiles !== 1 ? "s" : ""}
          </p>
          ·
          <p className="text-xs text-muted-foreground">
            Sent: {new Date(collaboration.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={collaboration.status} />
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Button>
  );
}
