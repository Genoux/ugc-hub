"use client";

import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface StepRatesProps {
  piecesOfContent: string;
  totalPaid: string;
  onPiecesChange: (value: string) => void;
  onTotalPaidChange: (value: string) => void;
}

export function StepRates({
  piecesOfContent,
  totalPaid,
  onPiecesChange,
  onTotalPaidChange,
}: StepRatesProps) {
  const pieces = parseInt(piecesOfContent, 10);
  const paid = parseFloat(totalPaid);
  const avgPerPiece = pieces > 0 && paid > 0 ? (paid / pieces).toFixed(2) : null;

  return (
    <div className="rounded-xl bg-muted/60 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <Field>
            <FieldLabel htmlFor="input-demo-api-key">Unique pieces of content</FieldLabel>
            <Input
              value={piecesOfContent}
              onChange={(e) => onPiecesChange(e.target.value)}
              id="input-demo-api-key"
              type="number"
              min="1"
              placeholder="e.g. 3"
            />
            <FieldDescription>Not counting hook variations</FieldDescription>
          </Field>
        </div>

        <div className="space-y-1.5">
          <Field>
            <FieldLabel htmlFor="input-demo-api-key">Total paid ($)</FieldLabel>
            <Input
              value={totalPaid}
              onChange={(e) => onTotalPaidChange(e.target.value)}
              id="input-demo-api-key"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 900"
            />
            <FieldDescription></FieldDescription>
          </Field>
        </div>
      </div>

      {avgPerPiece && (
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <span className="text-sm text-muted-foreground">Avg. per unique piece</span>
          <span className="text-sm font-semibold">${avgPerPiece}</span>
        </div>
      )}
    </div>
  );
}
