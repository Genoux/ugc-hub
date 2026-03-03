"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { RATING_CONFIG } from "@/features/creators/constants";
import { Badge } from "@/shared/components/ui/badge";
import { BentoCard } from "./_components/bento-card";
import { SubmissionSection } from "./submission-section";

type ClosedCollab = CreatorProfile["closedCollaborations"][number];

interface CollaborationCardProps {
  collab: ClosedCollab;
}

export function CollaborationCard({ collab }: CollaborationCardProps) {
  const [open, setOpen] = useState(false);
  const totalPaid = collab.totalPaidCents != null ? collab.totalPaidCents / 100 : null;
  const perPiece =
    totalPaid != null && collab.piecesOfContent ? totalPaid / collab.piecesOfContent : null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium text-foreground leading-none">{collab.projectName}</p>
          {collab.piecesOfContent != null && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {collab.piecesOfContent} piece{collab.piecesOfContent === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t"
          >
            <div className="p-4 space-y-2">
              <div className="grid grid-cols-4 gap-1">
                {totalPaid && (
                  <BentoCard>
                    <p className="text-sm font-medium text-foreground">Total Paid</p>
                    <div className="flex flex-col gap-2">
                      <p className="text-2xl font-bold text-foreground">
                        ${totalPaid.toLocaleString()}
                      </p>
                      {perPiece != null && (
                        <p className="text-xs text-muted-foreground">
                          ${perPiece.toFixed(0)} / piece
                        </p>
                      )}
                    </div>
                  </BentoCard>
                )}
                <BentoCard>
                  <p className="text-sm font-medium text-foreground">Closed</p>
                  <p className="text-sm font-semibold text-foreground">
                    {collab.closedAt.toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </BentoCard>
                {collab.piecesOfContent != null && (
                  <BentoCard>
                    <p className="text-md font-medium text-foreground">Pieces of Content</p>
                    <p className="text-2xl font-bold text-foreground">{collab.piecesOfContent}</p>
                  </BentoCard>
                )}
                {collab.reviewNotes && (
                  <BentoCard className="justify-between">
                    <p className="text-xs text-muted-foreground font-medium">Review Notes</p>
                    <p className="text-xs text-foreground">{collab.reviewNotes}</p>
                    {collab.closedBy && (
                      <div className="flex items-center gap-1.5">
                        {collab.closedBy.imageUrl && (
                          <Image
                            src={collab.closedBy.imageUrl}
                            alt={collab.closedBy.name ?? ""}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {collab.closedBy.name ?? collab.closedBy.email}
                        </p>
                      </div>
                    )}
                  </BentoCard>
                )}
              </div>
              {(collab.ratingVisualQuality ||
                collab.ratingActingDelivery ||
                collab.ratingReliabilitySpeed) && (
                <div className="grid grid-cols-3 gap-1">
                  {collab.ratingVisualQuality && (
                    <BentoCard>
                      <span className="text-xs text-muted-foreground">Visual</span>
                      <Badge
                        variant="outline"
                        className={`text-xs w-fit ${RATING_CONFIG[collab.ratingVisualQuality].className}`}
                      >
                        {collab.ratingVisualQuality}
                      </Badge>
                    </BentoCard>
                  )}
                  {collab.ratingActingDelivery && (
                    <BentoCard>
                      <span className="text-xs text-muted-foreground">Acting</span>
                      <Badge
                        variant="outline"
                        className={`text-xs w-fit ${RATING_CONFIG[collab.ratingActingDelivery].className}`}
                      >
                        {collab.ratingActingDelivery}
                      </Badge>
                    </BentoCard>
                  )}
                  {collab.ratingReliabilitySpeed && (
                    <BentoCard>
                      <span className="text-xs text-muted-foreground">Reliability</span>
                      <Badge
                        variant="outline"
                        className={`text-xs w-fit ${RATING_CONFIG[collab.ratingReliabilitySpeed].className}`}
                      >
                        {collab.ratingReliabilitySpeed}
                      </Badge>
                    </BentoCard>
                  )}
                </div>
              )}
              {collab.submissions.map((submission) => (
                <SubmissionSection key={submission.id} submission={submission} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
