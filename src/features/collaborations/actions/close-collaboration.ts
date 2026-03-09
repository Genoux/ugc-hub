"use server";

import { eq } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { type CloseCollaborationInput, closeCollaborationSchema } from "../schemas";

export async function closeCollaboration(input: CloseCollaborationInput) {
  try {
    const { userId } = await requireAdmin();
    const data = closeCollaborationSchema.parse(input);

    await db
      .update(collaborations)
      .set({
        status: "closed",
        closedAt: new Date(),
        closedBy: userId,
        ratingVisualQuality: data.ratings.visual_quality,
        ratingActingDelivery: data.ratings.acting_line_delivery,
        ratingReliabilitySpeed: data.ratings.reliability_speed,
        piecesOfContent: data.piecesOfContent,
        totalPaid: Math.round(data.totalPaid * 100), // dollars → cents
        reviewNotes: data.notes,
      })
      .where(eq(collaborations.id, data.collaborationId));

    await db
      .update(creators)
      .set({ overallRating: data.overallRating })
      .where(eq(creators.id, data.creatorId));
  } catch (err) {
    throw toActionError(err);
  }
}
