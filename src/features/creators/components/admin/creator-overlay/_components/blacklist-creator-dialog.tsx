"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { blacklistCreator } from "@/features/creators/actions/admin/blacklist-creator";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

interface BlacklistCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  reason: string;
  onReasonChange: (reason: string) => void;
}

export function BlacklistCreatorDialog({
  open,
  onOpenChange,
  creatorId,
  creatorName,
  reason,
  onReasonChange,
}: BlacklistCreatorDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!reason.trim()) return;

    startTransition(async () => {
      try {
        await blacklistCreator(creatorId, reason.trim());
        toast.success(`${creatorName} has been blacklisted`);
        onOpenChange(false);
      } catch {
        toast.error("Failed to blacklist creator. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blacklist {creatorName}</DialogTitle>
          <DialogDescription>
            This creator will be marked as blacklisted. Provide a reason for the record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="blacklist-reason">Reason</Label>
          <Textarea
            id="blacklist-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Explain why this creator is being blacklisted..."
            className="h-24 resize-none"
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || !reason.trim()}
          >
            Blacklist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
