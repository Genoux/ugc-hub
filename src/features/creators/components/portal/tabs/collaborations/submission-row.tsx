"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  CollapsibleSection,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { Button } from "@/shared/components/ui/button";

type Submission = CreatorSubmissions[number]["submissions"][number];

interface SubmissionRowProps {
  submission: Submission;
}

function SubmissionRowContent({ submission }: SubmissionRowProps) {
  const { open } = useCollapsible();
  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center rounded-none! justify-between p-6 hover:bg-accent/40 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-medium text-foreground">{submission.label}</p>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {submission.assets.map((asset) => (
              <AssetCard
                key={asset.id}
                src={asset.url || null}
                filename={asset.filename}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </>
  );
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
  return (
    <CollapsibleSection defaultOpen={true}>
      <SubmissionRowContent submission={submission} />
    </CollapsibleSection>
  );
}
