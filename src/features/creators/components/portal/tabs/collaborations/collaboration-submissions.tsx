"use client";

import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetVideo } from "@/shared/components/blocks/asset-card";
import { StatusBadge } from "@/shared/components/blocks/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { SubmissionRow } from "./submission-row";

type Collaboration = CreatorSubmissions[number];

interface CollaborationSubmissionsProps {
  collaboration: Collaboration;
  onBack: () => void;
}

export function CollaborationSubmissions({ collaboration, onBack }: CollaborationSubmissionsProps) {
  const submissions = collaboration.submissions;
  const highlights = collaboration.highlights;
  const hasSubmissions = submissions.length > 0;
  const hasHighlight = highlights.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack}>Collaborations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <div className="flex items-center gap-2">
                <BreadcrumbPage>{collaboration.projectName}</BreadcrumbPage>
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <StatusBadge status={collaboration.status} />
      </div>

      {hasSubmissions && (
        <div className="space-y-2">
          {submissions.map((submission) => (
            <SubmissionRow key={submission.id} submission={submission} />
          ))}
        </div>
      )}

      {hasHighlight && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Highlights</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {highlights.map((h) => (
              <AssetVideo key={h.id} src={h.url || null} filename={h.filename} />
            ))}
          </div>
        </div>
      )}

      {!hasSubmissions && !hasHighlight && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No submissions yet</EmptyTitle>
            <EmptyDescription>
              There is no submitted content or highlights for this collaboration.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
