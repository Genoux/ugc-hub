"use client";

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
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/60 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground block">
              Unique pieces of content
              <span className="block text-[10px] text-muted-foreground/60">
                Not counting hook variations
              </span>
            </Label>
            <Input
              type="number"
              min="1"
              value={piecesOfContent}
              onChange={(e) => onPiecesChange(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground block">
              Total paid ($)
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={totalPaid}
              onChange={(e) => onTotalPaidChange(e.target.value)}
              placeholder="e.g. 900"
            />
          </div>
        </div>

        {avgPerPiece && (
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="text-sm text-muted-foreground">Avg. per unique piece</span>
            <span className="text-base font-semibold text-foreground">${avgPerPiece}</span>
          </div>
        )}
      </div>
    </div>
  );
}
