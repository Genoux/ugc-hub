"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubmission } from "../actions/create-submission";

export function useCreateSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmission,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["submissions"],
        type: "active",
      });
    },
  });
}
