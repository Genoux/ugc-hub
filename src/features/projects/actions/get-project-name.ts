"use server";

import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function getProjectName(id: string): Promise<string | null> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    columns: { name: true },
  });
  return project?.name ?? null;
}
