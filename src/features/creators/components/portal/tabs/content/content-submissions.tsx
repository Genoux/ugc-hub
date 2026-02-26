"use client";

import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { StatusBadge } from "@/shared/components/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { SubmissionRow } from "./submission-row";

type Collaboration = CreatorSubmissions[number];

interface ContentSubmissionsProps {
  collaboration: Collaboration;
  onBack: () => void;
}

export function ContentSubmissions({ collaboration, onBack }: ContentSubmissionsProps) {
  return (
    <div className="space-y-4 pt-2">
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

      <div className="space-y-2">
        {collaboration.submissions.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}
