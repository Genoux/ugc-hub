"use client";

import { redirect } from "next/navigation";
import { use } from "react";
import { useCampaignQuery } from "@/features/campaigns/hooks/use-campaigns-query";
import { CampaignDetailClient } from "./client";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useCampaignQuery(id);

  if (isLoading) {
    return null;
  }

  if (!data?.campaign) {
    redirect("/campaigns");
  }

  return <CampaignDetailClient campaign={data.campaign} submissions={data.submissions} />;
}
