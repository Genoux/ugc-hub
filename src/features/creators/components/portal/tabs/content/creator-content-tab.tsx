"use client";

import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { ProjectCard } from "./project-card";
import { ProjectDetail } from "./project-detail";

interface CreatorContentTabProps {
  content: CreatorSubmissions;
}

export function CreatorContentTab({ content }: CreatorContentTabProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects = content.filter((p) => p.submissions.length > 0);

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Projects you've submitted content for will appear here.
      </div>
    );
  }

  if (selectedProjectId) {
    const project = projects.find((p) => p.projectId === selectedProjectId);
    if (project) {
      return (
        <ProjectDetail
          project={project}
          onBack={() => setSelectedProjectId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-2 pt-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.projectId}
          project={project}
          onClick={() => setSelectedProjectId(project.projectId)}
        />
      ))}
    </div>
  );
}
