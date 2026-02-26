"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { StatusBadge } from "@/shared/components/status-badge";
import { Button } from "@/shared/components/ui/button";

type Project = CreatorSubmissions[number];

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const totalFiles = project.submissions.reduce((s, sub) => s + sub.assets.length, 0);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-border p-6 hover:bg-accent/40 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">{project.projectName}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={project.status} />
        <p className="text-xs text-muted-foreground">
          {project.submissions.length} submission{project.submissions.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {totalFiles} file{totalFiles !== 1 ? "s" : ""}
        </p>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Button>
  );
}
