import { count, eq, sql } from "drizzle-orm";
import { campaigns, submissions } from "@/db/schema";
import { CampaignList } from "@/features/campaigns/components/campaign-list";
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

  return <CampaignList campaigns={campaignRows} />;
}
