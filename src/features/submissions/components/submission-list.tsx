"use client";

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { deleteSubmission } from "../actions/delete-submission";
import { SubmissionStatusBadge } from "./submission-status-badge";

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
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  function openDeleteDialog(submissionId: string) {
    setSubmissionToDelete(submissionId);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!submissionToDelete) return;

    try {
      await deleteSubmission(submissionToDelete);
      toast.success("Submission deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete submission");
    } finally {
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Submissions</h2>
        {onCreateLink && (
          <Button onClick={onCreateLink} disabled={isCreatingLink} size="sm">
            <Plus className="size-4" />
            {isCreatingLink ? "Creating..." : "New Link"}
          </Button>
        )}
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => {
            const link = submission.link;
            return (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/25 cursor-pointer"
              >
                <div className="flex-1">
                  {submission.status === "awaiting" ? (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        Awaiting submission
                      </p>
                      {link && (
                        <div className="flex items-center gap-0.5">
                          <Link
                            href={`/submit/${link.token}`}
                            target="_blank"
                            className="font-mono text-xs text-muted-foreground hover:underline"
                          >
                            /submit/{link.token}
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(link.token);
                            }}
                            className="p-1 text-muted-foreground cursor-pointer"
                          >
                            {copiedToken === link.token ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
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
                  <div className="w-fit">
                    <SubmissionStatusBadge
                      status={submission.status as "awaiting" | "pending" | "approved" | "rejected"}
                    />
                  </div>
                  {submission.status !== "awaiting" && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <Button
                    className="text-muted-foreground cursor-pointer"
                    onClick={() => openDeleteDialog(submission.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
