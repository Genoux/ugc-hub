"use server";

import { eq } from "drizzle-orm";
import { assets, collaborations, submissions } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

type Scope = { projectId: string } | { collaborationId: string } | { submissionId: string };

export async function getAssets(scope: Scope) {
  try {
    await requireAdmin();

    if ("submissionId" in scope) {
      const rows = await db
        .select({ id: assets.id, filename: assets.filename })
        .from(assets)
        .where(eq(assets.submissionId, scope.submissionId));
      return { data: rows };
    }

    if ("collaborationId" in scope) {
      const rows = await db
        .select({ id: assets.id, filename: assets.filename })
        .from(assets)
        .innerJoin(submissions, eq(assets.submissionId, submissions.id))
        .where(eq(submissions.collaborationId, scope.collaborationId));
      return { data: rows };
    }

    const rows = await db
      .select({ id: assets.id, filename: assets.filename })
      .from(assets)
      .innerJoin(submissions, eq(assets.submissionId, submissions.id))
      .innerJoin(collaborations, eq(submissions.collaborationId, collaborations.id))
      .where(eq(collaborations.projectId, scope.projectId));

    return { data: rows };
  } catch (err) {
    throw toActionError(err);
  }
}
