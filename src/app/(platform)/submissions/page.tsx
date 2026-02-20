import { count, eq, sql } from "drizzle-orm";
import { creatorCollaborations, creatorSubmissions, submissions } from "@/db/schema";
import { SubmissionList } from "@/features/submissions/components/submission-list";
import { db } from "@/shared/lib/db";

export default async function SubmissionsPage() {
  const rows = await db
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
