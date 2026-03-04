"use client";

import { ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";
import type { CollaborationDetail } from "@/features/projects/actions/get-collaboration-detail";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { Button } from "@/shared/components/ui/button";

type Submission = CollaborationDetail["submissions"][number];

function SubmissionSectionContent({
  submission,
  projectName,
  creatorFullName,
}: {
  submission: Submission;
  projectName: string;
  creatorFullName: string;
}) {
  const { open } = useCollapsible();

  async function handleDownloadSubmission(e: React.MouseEvent) {
    e.stopPropagation();
    await downloadAssets(
      submission.assets.map((a) => ({ id: a.id, filename: a.filename, url: a.url })),
      {
        onError: (filename) => toast.error(`Failed to download ${filename}`),
        zipName: `${projectName} - Submission ${submission.submissionNumber} - ${creatorFullName}`,
      },
    );
  }

  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between rounded-none py-6 hover:bg-accent/40 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">{submission.label}</span>
            <span className="text-xs text-muted-foreground">
              {submission.assets.length} file{submission.assets.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {submission.assets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadSubmission}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download all
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(submission.deliveredAt).toLocaleDateString()}
            </span>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
            />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-5">
          {submission.assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files in this submission.</p>
          ) : (
            <div className="flex overflow-x-auto gap-2">
              {submission.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  src={asset.url}
                  size="sm"
                  filename={asset.filename}
                  action={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadAssets([{ id: asset.id, filename: asset.filename, url: asset.url }], {
                      onError: () => toast.error("Download failed"),
                    });
                  }}
                  buttonIcon={<Download className="h-4 w-4" />}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </>
  );
}

export function SubmissionSection({
  submission,
  projectName,
  creatorFullName,
}: {
  submission: Submission;
  projectName: string;
  creatorFullName: string;
}) {
  return (
    <CollapsibleSection>
      <SubmissionSectionContent
        submission={submission}
        projectName={projectName}
        creatorFullName={creatorFullName}
      />
    </CollapsibleSection>
  );
}
