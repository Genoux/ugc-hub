import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creatorFolders, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { SubmissionDetailClient } from "./client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) redirect("/submissions");

  const [submission, folders] = await Promise.all([
    db.query.submissions.findFirst({ where: eq(submissions.id, id) }),
    db.query.creatorFolders.findMany({
      where: eq(creatorFolders.submissionId, id),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
      with: {
        creator: { columns: { id: true, fullName: true, email: true } },
        creatorSubmissions: {
          with: { submissionAssets: { columns: { id: true, filename: true } } },
        },
      },
    }),
  ]);

  if (!submission) redirect("/submissions");

  return <SubmissionDetailClient submission={submission} folders={folders} />;
}
