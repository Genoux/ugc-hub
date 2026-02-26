"use client";

import { ArrowLeft } from "lucide-react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { StatusBadge } from "@/shared/components/status-badge";
import { Button } from "@/shared/components/ui/button";
import { SubmissionRow } from "./submission-row";

type Project = CreatorSubmissions[number];

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const totalFiles = project.submissions.reduce((s, sub) => s + sub.assets.length, 0);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Button>
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{project.projectName}</p>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-muted-foreground ml-auto">
          {project.submissions.length} submission{project.submissions.length !== 1 ? "s" : ""} · {totalFiles}{" "}
          file{totalFiles !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {project.submissions.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}
