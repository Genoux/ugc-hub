"use client";

import { Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { deleteSubmission } from "../actions/delete-submission";

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
}: {
  campaignId: string;
  submissions: Submission[];
}) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function handleDelete(submissionId: string) {
    if (!confirm("Delete this submission?")) return;

    try {
      await deleteSubmission(submissionId);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }

  async function handleCopy(token: string) {
    const url = `${window.location.origin}/submit/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => {
            const link = submission.link;
            return (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  {submission.status === "awaiting" ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Awaiting submission
                      </p>
                      {link && (
                        <p className="font-mono text-xs text-muted-foreground">
                          /submit/{link.token}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Link href={`/campaigns/${campaignId}/submissions/${submission.id}`}>
                      <div>
                        <p className="text-sm font-medium">{submission.creatorName}</p>
                        <p className="text-xs text-muted-foreground">{submission.creatorEmail}</p>
                      </div>
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      submission.status === "approved"
                        ? "default"
                        : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {submission.status}
                  </Badge>
                  {link && submission.status === "awaiting" && (
                    <Button onClick={() => handleCopy(link.token)} variant="ghost" size="sm">
                      <Copy className="size-4" />
                      {copiedToken === link.token ? "Copied" : "Copy"}
                    </Button>
                  )}
                  {submission.status !== "awaiting" && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <Button onClick={() => handleDelete(submission.id)} variant="ghost" size="sm">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
