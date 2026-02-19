import { count, eq, sql } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, submissions } from "@/db/schema";
import { SubmissionList } from "@/features/submissions/components/submission-list";
import { db } from "@/shared/lib/db";

export default async function SubmissionsPage() {
  const rows = await db
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

  const data = rows.map((row) => ({
    ...row,
    totalCreators: Number(row.totalCreators),
    totalBatches: Number(row.totalBatches),
  }));

  return (
    <div className="flex flex-col gap-6 flex-1 p-8">
      <SubmissionList submissions={data} />
    </div>
  );
}
