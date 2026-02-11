"use client";

import { CampaignList } from "@/features/campaigns/components/campaign-list";
import { CampaignOverview } from "@/features/campaigns/components/campaign-overview";
import { useCampaignsQuery } from "@/features/campaigns/hooks/use-campaigns-query";

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaignsQuery();

  if (isLoading) {
    return null;
  }

  if (!campaigns) {
    return <div>Failed to load campaigns</div>;
  }

  const overviewStats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.totalSubmissions > 0).length,
    totalSubmissions: campaigns.reduce((sum, c) => sum + c.totalSubmissions, 0),
    pendingReview: campaigns.reduce((sum, c) => sum + c.pendingSubmissions, 0),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-6 flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <p className="text-sm text-muted-foreground">Manage your UGC campaigns and submissions</p>
      </div>
      <CampaignOverview {...overviewStats} />
      <CampaignList campaigns={campaigns} />
    </div>
  );
}
