"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubmission } from "../actions/create-submission";
import { deleteSubmission } from "../actions/delete-submission";

export function useCreateSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmission,
    onSuccess: async () => {
      // Force immediate refetch
      await queryClient.refetchQueries({
        queryKey: ["submissions"],
        type: "active",
      });
    },
  });
}

type Submission = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCreators: number;
  totalBatches: number;
};

export function useDeleteSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    // Optimistic update - instant UI
    onMutate: async (submissionId) => {
      await queryClient.cancelQueries({ queryKey: ["submissions"] });

      const previousSubmissions = queryClient.getQueryData<Submission[]>(["submissions"]);

      // Remove from cache immediately
      queryClient.setQueryData<Submission[]>(["submissions"], (old) =>
        old?.filter((c) => c.id !== submissionId),
      );

      return { previousSubmissions };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousSubmissions) {
        queryClient.setQueryData(["submissions"], context.previousSubmissions);
      }
    },
    onSettled: async () => {
      await queryClient.refetchQueries({
        queryKey: ["submissions"],
        type: "active",
      });
    },
  });
}
