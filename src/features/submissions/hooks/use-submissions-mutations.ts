"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteSubmission } from "../actions/delete-submission";

type CampaignQueryData = {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    userId: string;
  };
  submissions: Array<{
    id: string;
    campaignId: string;
    linkId: string;
    creatorName: string | null;
    creatorEmail: string | null;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
  }>;
};

export function useDeleteSubmissionMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    onMutate: async (submissionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["campaign", campaignId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<CampaignQueryData>(["campaign", campaignId]);

      // Optimistically update to the new value
      queryClient.setQueryData<CampaignQueryData>(["campaign", campaignId], (old) => {
        if (!old) return old;
        return {
          ...old,
          submissions: old.submissions.filter((s) => s.id !== submissionId),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["campaign", campaignId], context.previousData);
      }
      toast.error("Failed to delete submission");
    },
    onSuccess: () => {
      toast.success("Submission deleted");
    },
    onSettled: async () => {
      // Force immediate refetch, bypassing cache
      await queryClient.refetchQueries({ 
        queryKey: ["campaign", campaignId],
        type: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["campaigns"],
        type: 'active'
      });
    },
  });
}
