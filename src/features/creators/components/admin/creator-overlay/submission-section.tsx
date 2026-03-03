"use client";

import { ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  CollapsibleSection,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { Button } from "@/shared/components/ui/button";
import { downloadAssets } from "@/features/projects/lib/download-assets";

type CollabSubmission = CreatorProfile["closedCollaborations"][number]["submissions"][number];

interface SubmissionSectionProps {
  submission: CollabSubmission;
}

function SubmissionSectionContent({ submission }: SubmissionSectionProps) {
  const { open } = useCollapsible();
  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full border-none flex items-center rounded-none! justify-between px-4 py-3 hover:bg-accent/40 text-left"
        >
          <p className="text-sm font-medium text-foreground">{submission.label}</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {new Date(submission.deliveredAt).toLocaleDateString()}
            </p>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
            />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4">
          {submission.assets.length > 0 ? (
            <div className="flex overflow-x-auto gap-2">
              {submission.assets.map((asset) => (
                <AssetCard
                  className="w-40"
                  key={asset.id}
                  src={asset.url}
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
          ) : (
            <p className="text-sm text-muted-foreground">No assets uploaded.</p>
          )}
        </div>
      </CollapsibleContent>
    </>
  );
}

export function SubmissionSection({ submission }: SubmissionSectionProps) {
  return (
    <CollapsibleSection>
      <SubmissionSectionContent submission={submission} />
    </CollapsibleSection>
  );
}
