"use server";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import type { CollaborationHighlight } from "@/entities/creator/types";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { calculateCreatorRating } from "@/shared/lib/calculate-ratings";
import { db } from "@/shared/lib/db";
import { type EditCollaborationInput, editCollaborationSchema } from "../schemas";

export async function editCollaboration(input: EditCollaborationInput) {
  try {
    const { userId } = await requireAdmin();
    const data = editCollaborationSchema.parse(input);

    const existing = await db.query.collaborations.findFirst({
      where: and(
        eq(collaborations.id, data.collaborationId),
        eq(collaborations.creatorId, data.creatorId),
      ),
      columns: { id: true, projectId: true, highlights: true },
    });

    if (!existing) throw new Error("Collaboration not found");

    const priorClosed = await db.query.collaborations.findMany({
      where: and(
        eq(collaborations.creatorId, data.creatorId),
        eq(collaborations.status, "closed"),
        ne(collaborations.id, data.collaborationId),
      ),
      columns: {
        ratingVisualQuality: true,
        ratingActingDelivery: true,
        ratingReliabilitySpeed: true,
      },
    });

    const overallRating = calculateCreatorRating([
      ...priorClosed,
      {
        ratingVisualQuality: data.ratings.visual_quality,
        ratingActingDelivery: data.ratings.acting_line_delivery,
        ratingReliabilitySpeed: data.ratings.reliability_speed,
      },
    ]);

    const keepSet = new Set(data.keepHighlightKeys);
    const previous = (existing.highlights ?? []) as CollaborationHighlight[];
    const kept = previous.filter((h) => keepSet.has(h.r2Key));

    const newEntries = (data.newHighlights ?? []).map((h) => ({
      id: randomUUID(),
      r2Key: h.key,
      filename: h.filename,
      mimeType: h.mimeType,
      sizeBytes: h.sizeBytes,
      uploadedBy: userId,
    }));

    const highlights = [...kept, ...newEntries];
    const totalPaidCents = Math.round(data.totalPaid * 100);

    await db
      .update(collaborations)
      .set({
        ...(data.name != null ? { name: data.name } : {}),
        ratingVisualQuality: data.ratings.visual_quality,
        ratingActingDelivery: data.ratings.acting_line_delivery,
        ratingReliabilitySpeed: data.ratings.reliability_speed,
        piecesOfContent: data.piecesOfContent,
        totalPaid: totalPaidCents,
        reviewNotes: data.notes ?? null,
        highlights,
      })
      .where(eq(collaborations.id, data.collaborationId));

    await db.update(creators).set({ overallRating }).where(eq(creators.id, data.creatorId));
  } catch (err) {
    throw toActionError(err);
  }
}
