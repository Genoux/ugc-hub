"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteSubmission } from "../actions/delete-submission";

type SubmissionQueryData = {
  submission: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    userId: string;
  };
  folders: Array<{
    id: string;
    submissionId: string;
    creatorName: string | null;
    creatorEmail: string | null;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
  }>;
};

export function useDeleteSubmissionMutation(submissionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    onMutate: async (batchId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["submission", submissionId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<SubmissionQueryData>(["submission", submissionId]);

      // Optimistically update to the new value
      queryClient.setQueryData<SubmissionQueryData>(["submission", submissionId], (old) => {
        if (!old) return old;
        return {
          ...old,
          folders: old.folders.filter((s) => s.id !== batchId),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["submission", submissionId], context.previousData);
      }
      toast.error("Failed to delete batch");
    },
    onSuccess: () => {
      toast.success("Batch deleted");
    },
    onSettled: async () => {
      // Force immediate refetch, bypassing cache
      await queryClient.refetchQueries({ 
        queryKey: ["submission", submissionId],
        type: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["submissions"],
        type: 'active'
      });
    },
  });
}
