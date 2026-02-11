import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { campaigns, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return Response.json({ error: "Invalid campaign ID" }, { status: 400 });
  }

  const [campaign, campaignSubmissions] = await Promise.all([
    db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, id), eq(campaigns.userId, userId)),
    }),
    db.query.submissions.findMany({
      where: eq(submissions.campaignId, id),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      with: { link: true },
    }),
  ]);

  if (!campaign) {
    return Response.json({ error: "Campaign not found" }, { status: 404 });
  }

  return Response.json(
    { campaign, submissions: campaignSubmissions },
    {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
      },
    },
  );
}
