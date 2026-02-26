"use client";

import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { ContentProjects } from "./content-projects";
import { ContentSubmissions } from "./content-submissions";

interface ContentCollaborationsProps {
  content: CreatorSubmissions;
}

export function ContentCollaborations({ content }: ContentCollaborationsProps) {
  const [selectedCollaborationId, setSelectedCollaborationId] = useState<string | null>(null);

  const collaborations = content.filter((c) => c.submissions.length > 0);

  if (collaborations.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <Empty className="border border-dashed flex-1">
          <EmptyHeader>
            <EmptyTitle>No collaborations</EmptyTitle>
            <EmptyDescription>
              Projects you've submitted content for will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (selectedCollaborationId) {
    const collaboration = collaborations.find((c) => c.projectId === selectedCollaborationId);
    if (collaboration) {
      return (
        <ContentSubmissions
          collaboration={collaboration}
          onBack={() => setSelectedCollaborationId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-2 pt-2">
      {collaborations.map((collaboration) => (
        <ContentProjects
          key={collaboration.projectId}
          collaboration={collaboration}
          onClick={() => setSelectedCollaborationId(collaboration.projectId)}
        />
      ))}
    </div>
  );
}
