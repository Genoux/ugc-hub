"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetCard } from "@/shared/components/asset-card";
import { Button } from "@/shared/components/ui/button";

type Submission = CreatorSubmissions[number]["submissions"][number];

interface SubmissionRowProps {
  submission: Submission;
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center rounded-none!  justify-between p-6 hover:bg-accent/40 transition-colors text-left"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {submission.assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    src={asset.url || null}
                    filename={asset.filename}
                    isVideo={asset.mimeType.startsWith("video/")}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
