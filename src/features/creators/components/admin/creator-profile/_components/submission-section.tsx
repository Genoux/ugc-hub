"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetVideo } from "@/shared/components/blocks/asset-card";
import {
  CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { DownloadButton } from "@/shared/components/blocks/download-button";
import { Button } from "@/shared/components/ui/button";

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
                <AssetVideo
                  className="w-40"
                  key={asset.id}
                  src={asset.url}
                  filename={asset.filename}
                  actionSlot={
                    <DownloadButton
                      assets={[{ filename: asset.filename, url: asset.url }]}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white! hover:bg-white/20"
                      stopPropagation
                    />
                  }
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
