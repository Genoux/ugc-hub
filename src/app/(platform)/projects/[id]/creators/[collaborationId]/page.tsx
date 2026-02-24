import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { collaborations } from "@/db/schema";
import type { CollaborationHighlight } from "@/features/creators/constants";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { db } from "@/shared/lib/db";
import { CreatorCollaborationClient } from "./client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CreatorFolderPage({
  params,
}: {
  params: Promise<{ id: string; collaborationId: string }>;
}) {
  const { id, collaborationId } = await params;

  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(collaborationId)) redirect("/projects");

  const raw = await db.query.collaborations.findFirst({
    where: eq(collaborations.id, collaborationId),
    with: {
      project: { columns: { id: true, name: true } },
      creator: { columns: { id: true, fullName: true, email: true, profilePhoto: true } },
      submissions: {
        columns: { id: true, label: true, batchNumber: true, deliveredAt: true },
        orderBy: (s, { asc }) => [asc(s.batchNumber)],
        with: {
          assets: {
            columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
          },
        },
      },
    },
  });

  if (!raw || raw.project.id !== id) redirect(`/projects/${id}`);

  const [profilePhotoUrl, submissions, highlights] = await Promise.all([
    getR2SignedUrl(raw.creator.profilePhoto),
    Promise.all(
      raw.submissions.map(async (submission) => ({
        ...submission,
        assets: await Promise.all(
          submission.assets.map(async ({ r2Key, ...asset }) => ({
            ...asset,
            url: (await getR2SignedUrl(r2Key)) ?? "",
          })),
        ),
      })),
    ),
    Promise.all(
      ((raw.highlights ?? []) as CollaborationHighlight[]).map(async (h) => ({
        id: h.id,
        filename: h.filename,
        mimeType: h.mimeType,
        url: (await getR2SignedUrl(h.r2Key)) ?? "",
      })),
    ),
  ]);

  return (
    <CreatorCollaborationClient
      collaboration={{
        id: raw.id,
        status: raw.status,
        project: raw.project,
        creator: {
          id: raw.creator.id,
          fullName: raw.creator.fullName,
          email: raw.creator.email,
          profilePhotoUrl,
        },
        submissions,
        highlights,
      }}
    />
  );
}
