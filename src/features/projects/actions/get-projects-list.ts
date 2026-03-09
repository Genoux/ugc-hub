"use server";

import { countDistinct, eq, sql } from "drizzle-orm";
import { collaborations, projects, submissions } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCreators: number;
  totalSubmissions: number;
};

export async function getProjectsList(): Promise<ProjectListItem[]> {
  try {
    await requireAdmin();

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

    return rows.map((row) => ({
      ...row,
      totalCreators: Number(row.totalCreators),
      totalSubmissions: Number(row.totalSubmissions),
    }));
  } catch (err) {
    throw toActionError(err);
  }
}
