"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { RatingBadge } from "@/features/creators/components/rating-badge";
import {
  CollapsibleSection,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { Button } from "@/shared/components/ui/button";
import { BentoCard } from "./_components/bento-card";
import { SubmissionSection } from "./submission-section";
import { LabeledField } from "../../labeled-field";

type ClosedCollab = CreatorProfile["closedCollaborations"][number];

interface CollaborationCardProps {
  collab: ClosedCollab;
}

function CollaborationCardContent({
  collab,
  totalPaid,
  perPiece,
}: {
  collab: ClosedCollab;
  totalPaid: number | null;
  perPiece: number | null;
}) {
  const { open } = useCollapsible();

  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between rounded-none p-6 hover:bg-accent/40 transition-colors text-left"
        >
          <p className="text-sm font-medium text-foreground leading-none">{collab.projectName}</p>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-1">
            {totalPaid && (
              <BentoCard>
                <LabeledField
                  label="Total Paid"
                  value={
                    <p className="md:text-2xl text-xl font-bold text-foreground">
                      ${totalPaid.toLocaleString()}
                    </p>
                  }
                />
                {perPiece != null && (
                  <p className="text-xs text-muted-foreground">${perPiece.toFixed(0)} / piece</p>
                )}
              </BentoCard>
            )}
            <BentoCard>
              <LabeledField
                label="Closed"
                value={collab.closedAt.toLocaleDateString(undefined, { dateStyle: "long" })}
              />
            </BentoCard>
            {collab.piecesOfContent != null && (
              <BentoCard className="col-span-2 lg:col-span-1">
                <LabeledField label="Pieces of Content" value={collab.piecesOfContent} />
              </BentoCard>
            )}
            {collab.reviewNotes && (
              <BentoCard className="justify-between col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {collab.ratingVisualQuality && (
                <BentoCard>
                  <LabeledField
                    label="Visual"
                    value={<RatingBadge rating={collab.ratingVisualQuality} />}
                  />
                </BentoCard>
              )}
              {collab.ratingActingDelivery && (
                <BentoCard>
                  <LabeledField
                    label="Acting"
                    value={<RatingBadge rating={collab.ratingActingDelivery} />}
                  />
                </BentoCard>
              )}
              {collab.ratingReliabilitySpeed && (
                <BentoCard>
                  <LabeledField
                    label="Reliability"
                    value={<RatingBadge rating={collab.ratingReliabilitySpeed} />}
                  />
                </BentoCard>
              )}
            </div>
          )}
          {collab.submissions.map((submission) => (
            <SubmissionSection key={submission.id} submission={submission} />
          ))}
        </div>
      </CollapsibleContent>
    </>
  );
}

export function CollaborationCard({ collab }: CollaborationCardProps) {
  const totalPaid = collab.totalPaidCents != null ? collab.totalPaidCents / 100 : null;
  const perPiece =
    totalPaid != null && collab.piecesOfContent ? totalPaid / collab.piecesOfContent : null;

  return (
    <CollapsibleSection>
      <CollaborationCardContent collab={collab} totalPaid={totalPaid} perPiece={perPiece} />
    </CollapsibleSection>
  );
}
