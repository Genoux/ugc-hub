"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLink } from "../actions/create-link";

export function useCreateLinkMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLink,
    onSuccess: async () => {
      // Force immediate refetch after creating link
      await queryClient.refetchQueries({ 
        queryKey: ["campaign", campaignId],
        type: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["campaigns"],
        type: 'active'
      });
      toast.success("Link created");
    },
    onError: () => {
      toast.error("Failed to create link");
    },
  });
}
