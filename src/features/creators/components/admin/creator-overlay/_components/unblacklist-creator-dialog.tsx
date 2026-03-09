"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

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
}: UnblacklistCreatorDialogProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => unblacklistCreator(creatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.database });
      toast.success(`${creatorName} has been removed from the blacklist`);
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to remove creator from blacklist. Please try again."),
  });

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
          <AlertDialogAction onClick={() => mutate()} disabled={isPending}>
            Remove from blacklist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
