"use client";

import { ChevronRight, Files } from "lucide-react";
import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetCard } from "@/shared/components/asset-card";
import { Button } from "@/shared/components/ui/button";

type Submission = CreatorSubmissions[number]["submissions"][number];

interface SubmissionRowProps {
  submission: Submission;
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Files className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium text-foreground">{submission.label}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {submission.assets.length} file{submission.assets.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(submission.deliveredAt).toLocaleDateString()}
          </p>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </Button>

      <div className={`border-t border-border p-4 ${open ? "" : "hidden"}`}>
        {submission.assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files in this submission.</p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {submission.assets.map((asset) => (
              <AssetCard
                key={asset.id}
                src={asset.url || null}
                filename={asset.filename}
                isVideo={asset.mimeType.startsWith("video/")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
