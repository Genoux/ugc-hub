import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { campaigns, submissions } from "@/db/schema";
import { getCurrentUser } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { CampaignDetailClient } from "./client";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const campaign = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.id, id), eq(campaigns.userId, user.id)),
  });

  if (!campaign) {
    notFound();
  }

  const campaignSubmissions = await db.query.submissions.findMany({
    where: eq(submissions.campaignId, id),
    orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
    with: {
      link: true,
    },
  });

  return <CampaignDetailClient campaign={campaign} submissions={campaignSubmissions} />;
}
