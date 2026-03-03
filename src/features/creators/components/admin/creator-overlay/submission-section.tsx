"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { Button } from "@/shared/components/ui/button";
import { DownloadButton } from "./_components/download-button";

type CollabSubmission = CreatorProfile["closedCollaborations"][number]["submissions"][number];

interface SubmissionSectionProps {
  submission: CollabSubmission;
}

export function SubmissionSection({ submission }: SubmissionSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center rounded-none! justify-between px-4 py-3 hover:bg-accent/40 text-left"
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4">
              {submission.assets.length > 0 ? (
                <div className="flex overflow-x-auto gap-2">
                  {submission.assets.map((asset) => (
                    <AssetCard
                      className="w-40"
                      key={asset.id}
                      src={asset.url}
                      filename={asset.filename}
                      action={<DownloadButton url={asset.url} filename={asset.filename} />}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No assets uploaded.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
