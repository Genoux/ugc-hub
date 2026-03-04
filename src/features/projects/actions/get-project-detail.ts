"use server";

import { eq } from "drizzle-orm";
import { collaborations, projects } from "@/db/schema";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  uploadToken: string;
  collaborations: Array<{
    id: string;
    creator: {
      id: string;
      fullName: string;
      email: string;
      profilePhotoUrl: string | null;
    };
    submissions: Array<{
      id: string;
      assets: Array<{ id: string; filename: string }>;
    }>;
  }>;
};

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  await requireAdmin();

  const [project, rawCollaborations] = await Promise.all([
    db.query.projects.findFirst({ where: eq(projects.id, id) }),
    db.query.collaborations.findMany({
      where: eq(collaborations.projectId, id),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
      with: {
        creator: { columns: { id: true, fullName: true, email: true, profilePhoto: true } },
        submissions: {
          with: { assets: { columns: { id: true, filename: true } } },
        },
      },
    }),
  ]);

  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    uploadToken: project.uploadToken,
    collaborations: rawCollaborations.map((collab) => ({
      id: collab.id,
      creator: {
        id: collab.creator.id,
        fullName: collab.creator.fullName,
        email: collab.creator.email,
        profilePhotoUrl: toMediaUrl(collab.creator.profilePhoto),
      },
      submissions: collab.submissions,
    })),
  };
}
