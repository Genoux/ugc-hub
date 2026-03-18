"use client";

import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

interface StepLogDetailsProps {
  collabName: string;
  piecesOfContent: string;
  totalPaid: string;
  onNameChange: (value: string) => void;
  onPiecesChange: (value: string) => void;
  onTotalPaidChange: (value: string) => void;
  showNameField?: boolean;
}

export function StepLogDetails({
  collabName,
  piecesOfContent,
  totalPaid,
  onNameChange,
  onPiecesChange,
  onTotalPaidChange,
  showNameField = true,
}: StepLogDetailsProps) {
  const pieces = parseInt(piecesOfContent, 10);
  const paid = parseFloat(totalPaid);
  const avgPerPiece = pieces > 0 && paid > 0 ? (paid / pieces).toFixed(2) : null;

  return (
    <div className="space-y-4">
      {showNameField && (
        <div className="rounded-xl bg-muted/60 p-5">
          <Field>
            <FieldLabel htmlFor="log-collab-name">Collaboration name</FieldLabel>
            <Input
              id="log-collab-name"
              value={collabName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Brand X — Q1 campaign"
              autoComplete="off"
            />
            <FieldDescription>
              Name this collaboration (Brand name, campaign name, etc.)
            </FieldDescription>
          </Field>
        </div>
      )}

      <div className="rounded-xl bg-muted/60 p-5 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Field className="flex-1">
            <FieldLabel htmlFor="log-pieces">Unique pieces of content</FieldLabel>
            <Input
              id="log-pieces"
              value={piecesOfContent}
              onChange={(e) => onPiecesChange(e.target.value)}
              type="number"
              min="1"
              placeholder="e.g. 3"
            />
            <FieldDescription>Not counting hook variations</FieldDescription>
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="log-total-paid">Total paid ($)</FieldLabel>
            <Input
              id="log-total-paid"
              value={totalPaid}
              onChange={(e) => onTotalPaidChange(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 900"
            />
          </Field>
        </div>

        {avgPerPiece && (
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-sm text-muted-foreground">Avg. per unique piece</span>
            <span className="text-sm font-semibold">${avgPerPiece}</span>
          </div>
        )}
      </div>
    </div>
  );
}
