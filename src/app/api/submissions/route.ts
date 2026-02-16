import { auth } from "@clerk/nextjs/server";
import { count, eq, sql } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Middleware already checked domain - fetch all submissions
  const submissionRows = await db
    .select({
      id: submissions.id,
      name: submissions.name,
      description: submissions.description,
      createdAt: submissions.createdAt,
      totalCreators: count(creatorFolders.id),
      totalBatches: sql<number>`COUNT(DISTINCT ${creatorSubmissions.id})`,
    })
    .from(submissions)
    .leftJoin(creatorFolders, eq(creatorFolders.submissionId, submissions.id))
    .leftJoin(creatorSubmissions, eq(creatorSubmissions.creatorFolderId, creatorFolders.id))
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
