"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/shared/components/status-badge";
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
import { useDeleteSubmissionMutation } from "../hooks/use-submissions-mutations";

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

export function SubmissionItem({
  submission,
  campaignId,
}: {
  submission: Submission;
  campaignId: string;
}) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteSubmissionMutation = useDeleteSubmissionMutation(campaignId);

  async function handleCopy(token: string) {
    const url = `${window.location.origin}/submit/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function confirmDelete() {
    deleteSubmissionMutation.mutate(submission.id);
    setDeleteDialogOpen(false);
  }

  const link = submission.link;
  const submissionUrl = `/campaigns/${campaignId}/submissions/${submission.id}`;
  const isDeleting = deleteSubmissionMutation.isPending;
  const isAwaiting = submission.status === "awaiting";
  const baseClassName = `flex items-center justify-between rounded-lg border p-3 transition-opacity ${
    isDeleting ? "opacity-50 pointer-events-none" : ""
  }`;

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-fit">
        <StatusBadge
          key={`${submission.id}-${submission.status}`}
          status={submission.status as "awaiting" | "pending" | "approved" | "rejected"}
        />
      </div>
      <Button
        type="button"
        className="text-muted-foreground cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDeleteDialogOpen(true);
        }}
        variant="ghost"
        size="sm"
        disabled={isDeleting}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  if (isAwaiting) {
    return (
      <>
        <div className={baseClassName}>
          <div className="flex-1 min-w-0">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-muted-foreground">Awaiting submission</p>
              {link && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => window.open(`/submit/${link.token}`, "_blank")}
                    className="font-mono text-xs text-muted-foreground hover:underline text-left"
                  >
                    /submit/{link.token}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(link.token)}
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
          </div>
          {actions}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete submission?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the submission and all associated files. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Link href={submissionUrl} className={`${baseClassName} hover:bg-accent/25 cursor-pointer`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{submission.creatorName}</p>
          <p className="text-xs text-muted-foreground">{submission.creatorEmail}</p>
        </div>
        {actions}
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission and all associated files. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
