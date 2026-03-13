"use server";

import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { creators } from "@/db/schema";
import type { Creator } from "@/entities/creator/types";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

const PAGE_SIZE = 50;

export type ApplicantStatus = "applicant" | "approved_not_joined" | "rejected";

export type ApplicantSortKey = "newest" | "oldest" | "name";

export type GetApplicantsParams = {
  status: ApplicantStatus;
  sort: ApplicantSortKey;
  page: number;
};

export type GetApplicantsResult = {
  creators: Creator[];
  hasMore: boolean;
};

export async function getApplicants(params: GetApplicantsParams): Promise<GetApplicantsResult> {
  try {
    await requireAdmin();

    const { status, sort, page } = params;

    const orderBy =
      sort === "newest"
        ? desc(creators.appliedAt)
        : sort === "oldest"
          ? asc(creators.appliedAt)
          : asc(creators.fullName);

    const rows = await db
      .select()
      .from(creators)
      .where(eq(creators.status, status))
      .orderBy(orderBy)
      .limit(PAGE_SIZE + 1)
      .offset(page * PAGE_SIZE);

    const hasMore = rows.length > PAGE_SIZE;
    const slice = rows.slice(0, PAGE_SIZE);

    return { creators: slice, hasMore };
  } catch (err) {
    throw toActionError(err);
  }
}

export type ApplicantCounts = {
  applicant: number;
  approved_not_joined: number;
  rejected: number;
};

export async function getApplicantCounts(): Promise<ApplicantCounts> {
  try {
    await requireAdmin();

    const result = await db
      .select({
        applicant: sql<number>`count(*) filter (where ${creators.status} = 'applicant')`,
        approved_not_joined: sql<number>`count(*) filter (where ${creators.status} = 'approved_not_joined')`,
        rejected: sql<number>`count(*) filter (where ${creators.status} = 'rejected')`,
      })
      .from(creators)
      .where(inArray(creators.status, ["applicant", "approved_not_joined", "rejected"]));

    const row = result[0];
    if (!row) {
      return { applicant: 0, approved_not_joined: 0, rejected: 0 };
    }

    return {
      applicant: Number(row.applicant),
      approved_not_joined: Number(row.approved_not_joined),
      rejected: Number(row.rejected),
    };
  } catch (err) {
    throw toActionError(err);
  }
}
