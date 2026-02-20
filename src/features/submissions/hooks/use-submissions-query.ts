"use client";

import { useQuery } from "@tanstack/react-query";

type Submission = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCreators: number;
  totalBatches: number;
};

type SubmissionDetail = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  uploadToken: string;
  status: "active" | "closed";
  createdAt: Date;
  userId: string;
};

type CreatorFolder = {
  id: string;
  creator: {
    id: string;
    fullName: string;
    email: string;
  };
  creatorSubmissions: Array<{
    id: string;
    label: string;
    isNew: boolean;
    deliveredAt: Date;
    submissionAssets: Array<{
      id: string;
      filename: string;
    }>;
  }>;
};

export function useSubmissionsQuery() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      return data.submissions as Submission[];
    },
  });
}

export function useSubmissionQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch submission");
      const data = await res.json();
      return data as { submission: SubmissionDetail; folders: CreatorFolder[] };
    },
    enabled: options?.enabled ?? !!id,
  });
}
