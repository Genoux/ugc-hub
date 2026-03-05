"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { unblacklistCreator } from "@/features/creators/actions/admin/unblacklist-creator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface UnblacklistCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  blacklistReason: string | null;
}

export function UnblacklistCreatorDialog({
  open,
  onOpenChange,
  creatorId,
  creatorName,
  blacklistReason,
}: UnblacklistCreatorDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await unblacklistCreator(creatorId);
        toast.success(`${creatorName} has been removed from the blacklist`);
        onOpenChange(false);
      } catch {
        toast.error("Failed to remove creator from blacklist. Please try again.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {creatorName} from blacklist?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p>This creator will be restored to active status.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            Remove from blacklist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
