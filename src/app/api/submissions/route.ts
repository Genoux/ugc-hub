import { auth } from "@clerk/nextjs/server";
import { count, eq, sql } from "drizzle-orm";
import { creatorCollaborations, creatorSubmissions, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissionRows = await db
    .select({
      id: submissions.id,
      name: submissions.name,
      description: submissions.description,
      createdAt: submissions.createdAt,
      totalCreators: count(creatorCollaborations.id),
      totalBatches: sql<number>`COUNT(DISTINCT ${creatorSubmissions.id})`,
    })
    .from(submissions)
    .leftJoin(creatorCollaborations, eq(creatorCollaborations.submissionId, submissions.id))
    .leftJoin(creatorSubmissions, eq(creatorSubmissions.creatorCollaborationId, creatorCollaborations.id))
    .groupBy(submissions.id)
    .orderBy(submissions.createdAt);

  const submissionsWithNumbers = submissionRows.map((row) => ({
    ...row,
    totalCreators: Number(row.totalCreators),
    totalBatches: Number(row.totalBatches),
  }));

  return Response.json(
    { submissions: submissionsWithNumbers },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
