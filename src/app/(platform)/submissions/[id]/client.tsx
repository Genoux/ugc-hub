"use client";

import { Check, ChevronLeft, Copy } from "lucide-react";
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
    label: string;
    isNew: boolean;
    deliveredAt: Date;
    assets: Array<{
      id: string;
      filename: string;
    }>;
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
    <div className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/submissions">
              <ChevronLeft className="size-4" />
              Submissions
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{submission.name}</h1>
            {submission.description && (
              <p className="text-sm text-muted-foreground mt-1">{submission.description}</p>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleCopyToken} variant="outline" size="sm">
              {copiedToken ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copiedToken ? "Copied!" : "Copy Upload Link"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this link with creators to upload content</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <h2 className="text-sm font-medium">Creator Folders ({folders.length})</h2>

        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 border rounded-lg">
            <p className="text-sm text-muted-foreground">No creator uploads yet</p>
            <p className="text-xs text-muted-foreground">
              Share the upload link to start receiving content
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {folders.map((folder) => (
              <div key={folder.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{folder.creator.fullName}</p>
                    <p className="text-xs text-muted-foreground">{folder.creator.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {folder.creatorSubmissions.length} batch(es)
                  </span>
                </div>
                <div className="space-y-2">
                  {folder.creatorSubmissions.map((batch) => (
                    <Link
                      key={batch.id}
                      href={`/submissions/${submission.id}/submissions/${batch.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent/25 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{batch.label}</span>
                        {batch.isNew && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            New
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {batch.assets.length} file(s)
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(batch.deliveredAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
