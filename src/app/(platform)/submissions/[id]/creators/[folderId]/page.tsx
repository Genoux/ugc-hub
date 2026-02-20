import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creatorCollaborations } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { CreatorFolderClient } from "./client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CreatorFolderPage({
  params,
}: {
  params: Promise<{ id: string; folderId: string }>;
}) {
  const { id, folderId } = await params;

  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(folderId)) redirect("/submissions");

  const folder = await db.query.creatorCollaborations.findFirst({
    where: eq(creatorCollaborations.id, folderId),
    with: {
      submission: { columns: { id: true, name: true } },
      creator: { columns: { id: true, fullName: true, email: true } },
      creatorSubmissions: {
        columns: { id: true, label: true, batchNumber: true, deliveredAt: true },
        orderBy: (cs, { asc }) => [asc(cs.batchNumber)],
        with: {
          submissionAssets: {
            columns: { id: true, filename: true, mimeType: true, sizeBytes: true },
          },
        },
      },
      creatorPortfolioAssets: {
        columns: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
        orderBy: (pa, { asc }) => [asc(pa.createdAt)],
      },
    },
  });

  if (!folder || folder.submission.id !== id) redirect(`/submissions/${id}`);

  return (
    <CreatorFolderClient
      submissionId={id}
      submissionName={folder.submission.name}
      collaborationId={folderId}
      creator={folder.creator}
      collaborationStatus={folder.collaborationStatus}
      batches={folder.creatorSubmissions}
      portfolioAssets={folder.creatorPortfolioAssets}
    />
  );
}
