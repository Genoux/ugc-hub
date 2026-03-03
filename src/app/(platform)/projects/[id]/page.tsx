import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { collaborations, projects } from "@/db/schema";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { db } from "@/shared/lib/db";
import { ProjectDetailClient } from "./client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) redirect("/projects");

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

  if (!project) redirect("/projects");

  const signedCollaborations = rawCollaborations.map((collaboration) => ({
    ...collaboration,
    creator: {
      id: collaboration.creator.id,
      fullName: collaboration.creator.fullName,
      email: collaboration.creator.email,
      profilePhotoUrl: toMediaUrl(collaboration.creator.profilePhoto),
    },
  }));

  return <ProjectDetailClient project={project} collaborations={signedCollaborations} />;
}
