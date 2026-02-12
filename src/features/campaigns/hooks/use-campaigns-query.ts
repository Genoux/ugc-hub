"use client";

import { useQuery } from "@tanstack/react-query";

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

type CampaignDetail = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  userId: string;
};

type Submission = {
  id: string;
  campaignId: string;
  linkId: string;
  creatorName: string | null;
  creatorEmail: string | null;
  status: "pending" | "approved" | "rejected" | "awaiting";
  createdAt: Date;
  reviewedAt: Date | null;
  link: {
    id: string;
    token: string;
    campaignId: string;
    status: "active" | "used" | "expired" | "revoked";
    createdAt: Date;
    expiresAt: Date | null;
  };
};

export function useCampaignsQuery() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      return data.campaigns as Campaign[];
    },
  });
}

export function useCampaignQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch campaign");
      const data = await res.json();
      return data as { campaign: CampaignDetail; submissions: Submission[] };
    },
    enabled: options?.enabled ?? !!id,
  });
}
