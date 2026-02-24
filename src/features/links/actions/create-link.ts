"use server";

import { eq } from "drizzle-orm";
import type { z } from "zod";
import { projects } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { createLinkSchema } from "../schemas";

// Note: Links are now uploadTokens on the projects table
export async function createLink(input: z.infer<typeof createLinkSchema>) {
  const data = createLinkSchema.parse(input);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, data.submissionId),
    columns: { id: true, uploadToken: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return {
    id: project.id,
    token: project.uploadToken,
    submissionId: data.submissionId,
    status: "active" as const,
    createdAt: new Date(),
    expiresAt: data.expiresAt || null,
  };
}
