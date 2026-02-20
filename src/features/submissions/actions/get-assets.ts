"use server";

import { eq } from "drizzle-orm";
import { creatorCollaborations, creatorSubmissions, submissionAssets } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

type Scope =
  | { submissionId: string }
  | { collaborationId: string }
  | { creatorSubmissionId: string };

export async function getAssets(scope: Scope) {
  try {
    await requireAdmin();

    if ("creatorSubmissionId" in scope) {
      const rows = await db
        .select({ id: submissionAssets.id, filename: submissionAssets.filename })
        .from(submissionAssets)
        .where(eq(submissionAssets.creatorSubmissionId, scope.creatorSubmissionId));
      return { data: rows };
    }

    if ("collaborationId" in scope) {
      const rows = await db
        .select({ id: submissionAssets.id, filename: submissionAssets.filename })
        .from(submissionAssets)
        .innerJoin(
          creatorSubmissions,
          eq(submissionAssets.creatorSubmissionId, creatorSubmissions.id),
        )
        .where(eq(creatorSubmissions.creatorCollaborationId, scope.collaborationId));
      return { data: rows };
    }

    const rows = await db
      .select({ id: submissionAssets.id, filename: submissionAssets.filename })
      .from(submissionAssets)
      .innerJoin(
        creatorSubmissions,
        eq(submissionAssets.creatorSubmissionId, creatorSubmissions.id),
      )
      .innerJoin(creatorCollaborations, eq(creatorSubmissions.creatorCollaborationId, creatorCollaborations.id))
      .where(eq(creatorCollaborations.submissionId, scope.submissionId));

    return { data: rows };
  } catch (err) {
    throw toActionError(err);
  }
}
