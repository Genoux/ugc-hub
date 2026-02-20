"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creatorFolders, creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { closeCollaborationSchema, type CloseCollaborationInput } from "../schemas";

export async function closeCollaboration(input: CloseCollaborationInput) {
  try {
    const { userId } = await requireAdmin();
    const data = closeCollaborationSchema.parse(input);

    const perPieceRate =
      data.piecesOfContent > 0 ? parseFloat((data.totalPaid / data.piecesOfContent).toFixed(2)) : 0;

    const newCollaboration = {
      id: crypto.randomUUID(),
      creator_id: data.creatorId,
      brand: data.submissionName,
      date: new Date().toISOString().split("T")[0],
      pieces_of_content: data.piecesOfContent,
      total_paid: data.totalPaid,
      per_piece_rate: perPieceRate,
      notes: data.notes,
      ratings: {
        visual_quality: data.ratings.visual_quality,
        acting_line_delivery: data.ratings.acting_line_delivery,
        reliability_speed: data.ratings.reliability_speed,
      },
    };

    await db.transaction(async (tx) => {
      await tx
        .update(creatorFolders)
        .set({
          collaborationStatus: "closed",
          closedAt: new Date(),
          closedBy: userId,
          ratingVisualQuality: data.ratings.visual_quality,
          ratingActingDelivery: data.ratings.acting_line_delivery,
          ratingReliabilitySpeed: data.ratings.reliability_speed,
          piecesOfContent: data.piecesOfContent,
          totalPaid: Math.round(data.totalPaid * 100), // dollars → cents
          reviewNotes: data.notes,
        })
        .where(eq(creatorFolders.id, data.folderId));

      await tx
        .update(creators)
        .set({
          overallRating: data.overallRating,
          collaborations: sql`coalesce(${creators.collaborations}, '[]'::jsonb) || ${JSON.stringify([newCollaboration])}::jsonb`,
        })
        .where(eq(creators.id, data.creatorId));
    });

    revalidatePath("/submissions/[id]/creators/[folderId]", "page");
    revalidatePath("/database");
  } catch (err) {
    throw toActionError(err);
  }
}
