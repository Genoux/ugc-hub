"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import { notifySlack } from "@/integrations/slack/notify-slack";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { calculateCreatorRating } from "@/shared/lib/calculate-ratings";
import { db } from "@/shared/lib/db";
import { type LogCollaborationInput, logCollaborationSchema } from "../schemas";

export async function logCollaboration(input: LogCollaborationInput) {
  try {
    const { userId } = await requireAdmin();
    const data = logCollaborationSchema.parse(input);

    const priorClosed = await db.query.collaborations.findMany({
      where: and(eq(collaborations.creatorId, data.creatorId), eq(collaborations.status, "closed")),
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

    const highlights = (data.highlights ?? []).map((h) => ({
      id: randomUUID(),
      r2Key: h.key,
      filename: h.filename,
      mimeType: h.mimeType,
      sizeBytes: h.sizeBytes,
      uploadedBy: userId,
    }));

    const totalPaidCents = Math.round(data.totalPaid * 100);

    const [inserted] = await db
      .insert(collaborations)
      .values({
        creatorId: data.creatorId,
        projectId: null,
        name: data.name,
        status: "closed",
        closedAt: new Date(),
        closedBy: userId,
        ratingVisualQuality: data.ratings.visual_quality,
        ratingActingDelivery: data.ratings.acting_line_delivery,
        ratingReliabilitySpeed: data.ratings.reliability_speed,
        piecesOfContent: data.piecesOfContent,
        totalPaid: totalPaidCents,
        reviewNotes: data.notes ?? null,
        highlights,
      })
      .returning({ id: collaborations.id });

    await db.update(creators).set({ overallRating }).where(eq(creators.id, data.creatorId));

    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, data.creatorId),
      columns: { fullName: true },
    });

    if (inserted) {
      notifySlack({
        type: "admin_logged_collab",
        collabId: inserted.id,
        creatorId: data.creatorId,
        creatorName: creator?.fullName ?? "Unknown",
        collabName: data.name,
        piecesOfContent: data.piecesOfContent,
        totalPaidCents,
      });
    }
  } catch (err) {
    throw toActionError(err);
  }
}
