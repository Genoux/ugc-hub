import { count, eq, sql } from "drizzle-orm";
import { campaigns, submissions } from "@/db/schema";
import { CampaignList } from "@/features/campaigns/components/campaign-list";
import { CampaignOverview } from "@/features/campaigns/components/campaign-overview";
import { getCurrentUser } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export default async function CampaignsPage() {
  const user = await getCurrentUser();

  const campaignRows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      brief: campaigns.brief,
      createdAt: campaigns.createdAt,
      totalSubmissions: count(submissions.id),
      approvedSubmissions: count(sql`CASE WHEN ${submissions.status} = 'approved' THEN 1 END`),
      pendingSubmissions: count(sql`CASE WHEN ${submissions.status} = 'pending' THEN 1 END`),
      awaitingSubmissions: count(sql`CASE WHEN ${submissions.status} = 'awaiting' THEN 1 END`),
    })
    .from(campaigns)
    .leftJoin(submissions, eq(submissions.campaignId, campaigns.id))
    .where(eq(campaigns.userId, user.id))
    .groupBy(campaigns.id)
    .orderBy(campaigns.createdAt);

  const overviewStats = {
    totalCampaigns: campaignRows.length,
    activeCampaigns: campaignRows.filter((c) => c.totalSubmissions > 0).length,
    totalSubmissions: campaignRows.reduce((sum, c) => sum + c.totalSubmissions, 0),
    pendingReview: campaignRows.reduce((sum, c) => sum + c.pendingSubmissions, 0),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-6 flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <p className="text-sm text-muted-foreground">Manage your UGC campaigns and submissions</p>
      </div>
      <CampaignOverview {...overviewStats} />
      <CampaignList campaigns={campaignRows} />
    </div>
  );
}
