"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLink } from "../actions/create-link";

export function useCreateLinkMutation(submissionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLink,
    onSuccess: async () => {
      // Force immediate refetch after creating link
      await queryClient.refetchQueries({ 
        queryKey: ["submission", submissionId],
        type: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["submissions"],
        type: 'active'
      });
      toast.success("Link created");
    },
    onError: () => {
      toast.error("Failed to create link");
    },
  });
}
