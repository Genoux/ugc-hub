"use server";

import { eq } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import { notifySlack } from "@/integrations/slack/notify-slack";
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

    const collab = await db.query.collaborations.findFirst({
      where: eq(collaborations.id, data.collaborationId),
      with: {
        project: { columns: { name: true } },
        creator: { columns: { fullName: true } },
      },
    });

    if (collab) {
      void notifySlack({
        type: "admin_closed_collab",
        collabId: data.collaborationId,
        creatorName: collab.creator.fullName ?? "Unknown",
        projectName: collab.project.name,
        piecesOfContent: data.piecesOfContent,
        totalPaidCents: Math.round(data.totalPaid * 100),
      }).catch(console.error);
    }
  } catch (err) {
    throw toActionError(err);
  }
}
