"use client";

import { Check, ChevronLeft, ChevronRight, Copy, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

type Submission = {
  id: string;
  name: string;
  description: string | null;
  uploadToken: string;
};

type CreatorFolder = {
  id: string;
  creator: {
    id: string;
    fullName: string;
    email: string;
  };
  creatorSubmissions: Array<{
    id: string;
    submissionAssets: Array<{ id: string }>;
  }>;
};

export function SubmissionDetailClient({
  submission,
  folders,
}: {
  submission: Submission;
  folders: CreatorFolder[];
}) {
  const [copiedToken, setCopiedToken] = useState(false);

  async function handleCopyToken() {
    const url = `${window.location.origin}/submit/${submission.uploadToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/submissions">
              <ChevronLeft className="size-4" />
              Submissions
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">{submission.name}</h1>
            </div>
            {submission.description && (
              <p className="text-sm text-muted-foreground mt-1">{submission.description}</p>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleCopyToken} variant="outline" size="sm" className="shrink-0">
              {copiedToken ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copiedToken ? "Copied!" : "Copy Upload Link"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this link with creators to upload content</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Creator list */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {folders.length} creator{folders.length !== 1 ? "s" : ""}
        </p>

        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <Folder className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">No uploads yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share the upload link to start receiving content
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => {
              const totalFiles = folder.creatorSubmissions.reduce((s, b) => s + b.submissionAssets.length, 0);

              return (
                <Link
                  key={folder.id}
                  href={`/submissions/${submission.id}/creators/${folder.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 hover:bg-accent/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                      {folder.creator.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none">
                        {folder.creator.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{folder.creator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {folder.creatorSubmissions.length} batch
                      {folder.creatorSubmissions.length !== 1 ? "es" : ""} · {totalFiles} file
                      {totalFiles !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
