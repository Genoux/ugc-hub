import { countDistinct, eq, sql } from "drizzle-orm";
import { collaborations, projects, submissions } from "@/db/schema";
import { ProjectList } from "@/features/projects/components/project-list";
import { db } from "@/shared/lib/db";

export default async function ProjectsPage() {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: projects.createdAt,
      totalCreators: countDistinct(collaborations.creatorId),
      totalSubmissions: sql<number>`COUNT(DISTINCT ${submissions.id})`,
    })
    .from(projects)
    .leftJoin(collaborations, eq(collaborations.projectId, projects.id))
    .leftJoin(submissions, eq(submissions.collaborationId, collaborations.id))
    .groupBy(projects.id)
    .orderBy(projects.createdAt);

  const data = rows.map((row) => ({
    ...row,
    totalCreators: Number(row.totalCreators),
    totalSubmissions: Number(row.totalSubmissions),
  }));

  return (
    <div className="flex flex-col gap-6 flex-1 p-8">
      <ProjectList projects={data} />
    </div>
  );
}
