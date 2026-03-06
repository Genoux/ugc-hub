"use client";

import { FolderIcon } from "lucide-react";
import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { CollaborationCard } from "./collaboration-card";
import { CollaborationSubmissions } from "./collaboration-submissions";

interface CollaborationTabProps {
  content: CreatorSubmissions;
}

export function CollaborationTab({ content }: CollaborationTabProps) {
  const [selectedCollaborationId, setSelectedCollaborationId] = useState<string | null>(null);

  const collaborations = content.filter((c) => c.submissions.length > 0);

  if (collaborations.length === 0) {
    return (
      <div className="fixed top-[calc(3.5rem+1px)] inset-x-0 bottom-0 flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon size={16} />
            </EmptyMedia>
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
        <CollaborationSubmissions
          collaboration={collaboration}
          onBack={() => setSelectedCollaborationId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Collaborations</h1>
      <hr />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collaborations.map((collaboration) => (
          <CollaborationCard
            key={collaboration.projectId}
            collaboration={collaboration}
            onClick={() => setSelectedCollaborationId(collaboration.projectId)}
          />
        ))}
      </div>
    </div>
  );
}
