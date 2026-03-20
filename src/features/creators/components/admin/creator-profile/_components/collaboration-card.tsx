"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { LabeledField } from "@/features/creators/components/labeled-field";
import { AssetVideo } from "@/shared/components/blocks/asset-card";
import { Author } from "@/shared/components/blocks/authored-note";
import {
  CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
import { RatingBadge } from "@/shared/components/blocks/rating-badge";
import { Button } from "@/shared/components/ui/button";
import { BentoCard } from "./bento-card";

type ClosedCollab = CreatorProfile["closedCollaborations"][number];

interface CollaborationCardProps {
  collab: ClosedCollab;
  onEdit: (collab: ClosedCollab) => void;
}

function CollaborationCardContent({
  collab,
  totalPaid,
  perPiece,
  onEdit,
}: {
  collab: ClosedCollab;
  totalPaid: number | null;
  perPiece: number | null;
  onEdit: (collab: ClosedCollab) => void;
}) {
  const { open } = useCollapsible();

  return (
    <>
      <div className="flex w-full items-stretch hover:bg-accent/40">
        <CollapsibleTrigger asChild>
          <div className="w-full flex items-center justify-between  p-4">
            <div className="flex items-center justify-between gap-2">
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
              />
              <p className="truncate text-sm font-medium leading-none text-foreground">
                {collab.projectName}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Edit collaboration"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(collab);
              }}
            >
              Edit
            </Button>
          </div>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {totalPaid && (
                <BentoCard className="flex-2 min-w-[140px]">
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
              <BentoCard className="flex-2 min-w-[140px]">
                <LabeledField
                  label="Closed"
                  value={collab.closedAt.toLocaleDateString(undefined, { dateStyle: "long" })}
                />
              </BentoCard>
              {collab.piecesOfContent != null && (
                <BentoCard className="flex-1 min-w-[100px]">
                  <LabeledField label="Pieces of Content" value={collab.piecesOfContent} />
                </BentoCard>
              )}
              {collab.reviewNotes && (
                <BentoCard className="flex-3 min-w-[200px] justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Review Notes</p>
                  <p className="text-xs text-foreground">{collab.reviewNotes}</p>
                  {collab.closedBy && <Author author={collab.closedBy} />}
                </BentoCard>
              )}
            </div>
            <div>
              {(collab.ratingVisualQuality ||
                collab.ratingActingDelivery ||
                collab.ratingReliabilitySpeed) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    {collab.ratingVisualQuality && (
                      <BentoCard>
                        <LabeledField
                          label="Visual"
                          value={<RatingBadge color="white" rating={collab.ratingVisualQuality} />}
                        />
                      </BentoCard>
                    )}
                    {collab.ratingActingDelivery && (
                      <BentoCard>
                        <LabeledField
                          label="Acting"
                          value={<RatingBadge color="white" rating={collab.ratingActingDelivery} />}
                        />
                      </BentoCard>
                    )}
                    {collab.ratingReliabilitySpeed && (
                      <BentoCard>
                        <LabeledField
                          label="Reliability"
                          value={<RatingBadge color="white" rating={collab.ratingReliabilitySpeed} />}
                        />
                      </BentoCard>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-foreground">Highlights</h2>
            <div className="flex gap-2">
              {collab.highlights.map((h) => (
                <AssetVideo key={h.id} src={h.url} filename={h.filename} size="xs" />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </>
  );
}

export function CollaborationCard({ collab, onEdit }: CollaborationCardProps) {
  const totalPaid = collab.totalPaidCents != null ? collab.totalPaidCents / 100 : null;
  const perPiece =
    totalPaid != null && collab.piecesOfContent ? totalPaid / collab.piecesOfContent : null;

  return (
    <CollapsibleSection>
      <CollaborationCardContent
        collab={collab}
        totalPaid={totalPaid}
        perPiece={perPiece}
        onEdit={onEdit}
      />
    </CollapsibleSection>
  );
}
