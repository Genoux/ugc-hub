"use server";

import { inArray } from "drizzle-orm";
import { creators } from "@/db/schema";
import type { Creator } from "@/entities/creator/types";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export async function getApplicants(): Promise<Creator[]> {
  try {
    await requireAdmin();

    return db
      .select()
      .from(creators)
      .where(inArray(creators.status, ["applicant", "approved_not_joined", "rejected"]))
      .orderBy(creators.appliedAt);
  } catch (err) {
    throw toActionError(err);
  }
}
