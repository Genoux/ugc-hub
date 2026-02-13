"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign } from "../actions/create-campaign";
import { deleteCampaign } from "../actions/delete-campaign";

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: async () => {
      // Force immediate refetch
      await queryClient.refetchQueries({ 
        queryKey: ["campaigns"],
        type: 'active'
      });
    },
  });
}

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  awaitingSubmissions: number;
};

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    // Optimistic update - instant UI
    onMutate: async (campaignId) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);

      // Remove from cache immediately
      queryClient.setQueryData<Campaign[]>(["campaigns"], (old) =>
        old?.filter((c) => c.id !== campaignId),
      );

      return { previousCampaigns };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSettled: async () => {
      await queryClient.refetchQueries({ 
        queryKey: ["campaigns"],
        type: 'active'
      });
    },
  });
}
