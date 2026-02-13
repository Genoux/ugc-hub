"use client";

import { Plus } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { SubmissionItem } from "./submission-item";

type Submission = {
  id: string;
  creatorName: string | null;
  creatorEmail: string | null;
  status: string;
  createdAt: Date;
  link?: {
    id: string;
    token: string;
    status: string;
  };
};

export function SubmissionList({
  campaignId,
  submissions,
  onCreateLink,
  isCreatingLink,
}: {
  campaignId: string;
  submissions: Submission[];
  onCreateLink?: () => void;
  isCreatingLink?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-end justify-between">
        <h2 className="text-sm font-medium">Submissions</h2>
        {onCreateLink && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onCreateLink} disabled={isCreatingLink} size="sm">
                  <Plus className="size-4" />
                  {isCreatingLink ? "Generating..." : "Generate Link"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a new submission link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="Submissions"
          description="Generate a submission link to send to creators"
          action={
            onCreateLink
              ? {
                  label: isCreatingLink ? "Generating..." : "Generate Link",
                  onClick: onCreateLink,
                  icon: <Plus className="size-4" />,
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => (
            <SubmissionItem key={submission.id} submission={submission} campaignId={campaignId} />
          ))}
        </div>
      )}
    </div>
  );
}
