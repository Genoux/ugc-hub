"use server";

import { and, eq } from "drizzle-orm";
import { assets, collaborations, submissions } from "@/db/schema";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export type AssetWithUrl = { id: string; filename: string; url: string };

type Scope = { projectId: string } | { collaborationId: string } | { submissionId: string };

const completed = eq(assets.uploadStatus, "completed");

export async function getAssets(scope: Scope): Promise<{ data: AssetWithUrl[] }> {
  try {
    await requireAdmin();

    let rows: { id: string; filename: string; r2Key: string }[];

    if ("submissionId" in scope) {
      rows = await db
        .select({ id: assets.id, filename: assets.filename, r2Key: assets.r2Key })
        .from(assets)
        .where(and(eq(assets.submissionId, scope.submissionId), completed));
    } else if ("collaborationId" in scope) {
      rows = await db
        .select({ id: assets.id, filename: assets.filename, r2Key: assets.r2Key })
        .from(assets)
        .innerJoin(submissions, eq(assets.submissionId, submissions.id))
        .where(
          and(eq(submissions.collaborationId, scope.collaborationId), completed),
        );
    } else {
      rows = await db
        .select({ id: assets.id, filename: assets.filename, r2Key: assets.r2Key })
        .from(assets)
        .innerJoin(submissions, eq(assets.submissionId, submissions.id))
        .innerJoin(collaborations, eq(submissions.collaborationId, collaborations.id))
        .where(
          and(eq(collaborations.projectId, scope.projectId), completed),
        );
    }

    const data = rows
      .map((row) => {
        const url = toMediaUrl(row.r2Key);
        return url ? { id: row.id, filename: row.filename, url } : null;
      })
      .filter((a): a is AssetWithUrl => a !== null);

    return { data };
  } catch (err) {
    throw toActionError(err);
  }
}
