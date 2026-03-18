"use server";

import { and, asc, type Column, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import type { Filters } from "@/features/creators/components/admin/database-filters";
import type { SortKey } from "@/features/creators/hooks/admin/use-creator-filters";
import { type Creator, creatorSchema } from "@/features/creators/schemas";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import type { OverallRatingTier } from "@/shared/lib/constants";
import { OVERALL_RATING_TIERS, SOCIAL_PLATFORMS } from "@/shared/lib/constants";
import { db } from "@/shared/lib/db";

const PAGE_SIZE = 50;

export type CreatorListItem = Creator & { profilePhotoUrl: string | null };

export type GetCreatorsParams = {
  filters: Filters;
  sort: SortKey;
  search: string;
  page: number;
};

export type GetCreatorsResult = {
  creators: CreatorListItem[];
  hasMore: boolean;
};

function ratingOrderSql() {
  const cases = OVERALL_RATING_TIERS.map(
    (tier, i) => sql`WHEN ${creators.overallRating} = ${tier} THEN ${i}`,
  );
  return sql`CASE ${sql.join(cases, sql` `)} ELSE 99 END`;
}

function buildStatusRatingCondition(overallRating: OverallRatingTier[]) {
  if (overallRating.length === 0) return eq(creators.status, "joined");
  return and(
    inArray(creators.status, ["joined", "blacklisted"]),
    inArray(creators.overallRating, overallRating),
  );
}

function buildSortOrder(sort: SortKey) {
  switch (sort) {
    case "rating":
      return asc(ratingOrderSql());
    case "newest":
      return desc(creators.joinedAt);
    case "collaborations":
      return desc(count(collaborations.id));
    case "rate_low":
      return asc(sql`(${creators.rateRangeSelf}->>'min')::numeric`);
    case "rate_high":
      return desc(sql`(${creators.rateRangeSelf}->>'max')::numeric`);
  }
}

function arrayOverlap<T extends string>(column: Column, values: T[]) {
  return sql`${column} && ARRAY[${sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  )}]::text[]`;
}

export async function getCreators(params: GetCreatorsParams): Promise<GetCreatorsResult> {
  try {
    await requireAdmin();

    const { filters, sort, search, page } = params;

    const conditions = [
      buildStatusRatingCondition(filters.overallRating),
      ...(search.trim() ? [ilike(creators.fullName, `%${search.trim()}%`)] : []),
      ...(filters.genderIdentity.length > 0
        ? [inArray(creators.genderIdentity, filters.genderIdentity)]
        : []),
      ...(filters.ageDemographic.length > 0
        ? [inArray(creators.ageDemographic, filters.ageDemographic)]
        : []),
      ...(filters.ugcCategories.length > 0
        ? [arrayOverlap(creators.ugcCategories, filters.ugcCategories)]
        : []),
      ...(filters.contentFormats.length > 0
        ? [arrayOverlap(creators.contentFormats, filters.contentFormats)]
        : []),
      ...(filters.ethnicity.length > 0
        ? [arrayOverlap(creators.ethnicity, filters.ethnicity)]
        : []),
      // AND semantics: creator must be present on all selected platforms.
      ...(filters.socialPlatforms.length > 0
        ? filters.socialPlatforms.map((platform) => {
            const urlKey =
              SOCIAL_PLATFORMS.find((p) => p.value === platform)?.urlKey ?? "instagram_url";
            return sql`${creators.socialChannels}::jsonb ? ${urlKey}`;
          })
        : []),
      ...(filters.countries.length > 0 ? [inArray(creators.country, filters.countries)] : []),
      ...(filters.languages.length > 0
        ? [
            or(
              ...filters.languages.map(
                (lang) => sql`${creators.languages} @> ${JSON.stringify([lang])}::jsonb`,
              ),
            ),
          ]
        : []),
    ];

    const rows = await db
      .select({
        creator: creators,
        collabCount: count(collaborations.id),
      })
      .from(creators)
      .leftJoin(
        collaborations,
        and(eq(collaborations.creatorId, creators.id), eq(collaborations.status, "closed")),
      )
      .where(and(...conditions))
      .groupBy(creators.id)
      .orderBy(buildSortOrder(sort))
      .limit(PAGE_SIZE + 1)
      .offset(page * PAGE_SIZE);

    const hasMore = rows.length > PAGE_SIZE;
    const slice = rows.slice(0, PAGE_SIZE);

    return {
      creators: slice.map(({ creator, collabCount }) => {
        const parsed = creatorSchema.parse({ ...creator, collabCount: collabCount ?? 0 });
        return {
          ...parsed,
          profilePhotoUrl: toMediaUrl(parsed.profilePhoto, parsed.profileCompletedAt),
        };
      }),
      hasMore,
    };
  } catch (err) {
    throw toActionError(err);
  }
}
