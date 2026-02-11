import { auth } from "@clerk/nextjs/server";
import { count, eq, sql } from "drizzle-orm";
import { campaigns, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignRows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      createdAt: campaigns.createdAt,
      totalSubmissions: count(submissions.id),
      approvedSubmissions: sql<number>`COUNT(CASE WHEN ${submissions.status} = 'approved' THEN 1 END)`,
      pendingSubmissions: sql<number>`COUNT(CASE WHEN ${submissions.status} = 'pending' THEN 1 END)`,
      awaitingSubmissions: sql<number>`COUNT(CASE WHEN ${submissions.status} = 'awaiting' THEN 1 END)`,
    })
    .from(campaigns)
    .leftJoin(submissions, eq(submissions.campaignId, campaigns.id))
    .where(eq(campaigns.userId, userId))
    .groupBy(campaigns.id)
    .orderBy(campaigns.createdAt);

  const campaignsWithNumbers = campaignRows.map((row) => ({
    ...row,
    totalSubmissions: Number(row.totalSubmissions),
    approvedSubmissions: Number(row.approvedSubmissions),
    pendingSubmissions: Number(row.pendingSubmissions),
    awaitingSubmissions: Number(row.awaitingSubmissions),
  }));

  return Response.json(
    { campaigns: campaignsWithNumbers },
    {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
      },
    },
  );
}
