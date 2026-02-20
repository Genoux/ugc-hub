"use server";

import { eq } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, submissionAssets } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

type Scope = { submissionId: string } | { folderId: string } | { creatorSubmissionId: string };

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

    if ("folderId" in scope) {
      const rows = await db
        .select({ id: submissionAssets.id, filename: submissionAssets.filename })
        .from(submissionAssets)
        .innerJoin(
          creatorSubmissions,
          eq(submissionAssets.creatorSubmissionId, creatorSubmissions.id),
        )
        .where(eq(creatorSubmissions.creatorFolderId, scope.folderId));
      return { data: rows };
    }

    const rows = await db
      .select({ id: submissionAssets.id, filename: submissionAssets.filename })
      .from(submissionAssets)
      .innerJoin(
        creatorSubmissions,
        eq(submissionAssets.creatorSubmissionId, creatorSubmissions.id),
      )
      .innerJoin(creatorFolders, eq(creatorSubmissions.creatorFolderId, creatorFolders.id))
      .where(eq(creatorFolders.submissionId, scope.submissionId));

    return { data: rows };
  } catch (err) {
    throw toActionError(err);
  }
}
