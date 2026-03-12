"use server";

import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import type { Filters } from "@/features/creators/components/admin/database-filters";
import type { SortKey } from "@/features/creators/hooks/admin/use-creator-filters";
import { type Creator, creatorSchema } from "@/features/creators/schemas";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
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

export async function getCreators(params: GetCreatorsParams): Promise<GetCreatorsResult> {
  try {
    await requireAdmin();

    const { filters, sort, search, page } = params;
    const conditions = [
      inArray(creators.status, ["joined", "blacklisted"]),
      ...(search.trim() ? [ilike(creators.fullName, `%${search.trim()}%`)] : []),
      ...(filters.overallRating.length > 0
        ? [inArray(creators.overallRating, filters.overallRating)]
        : []),
      ...(filters.genderIdentity.length > 0
        ? [inArray(creators.genderIdentity, filters.genderIdentity)]
        : []),
      ...(filters.ageDemographic.length > 0
        ? [inArray(creators.ageDemographic, filters.ageDemographic)]
        : []),
      ...(filters.ugcCategories.length > 0
        ? [
            sql`${creators.ugcCategories} && ARRAY[${sql.join(
              filters.ugcCategories.map((c) => sql`${c}`),
              sql`, `,
            )}]::text[]`,
          ]
        : []),
      ...(filters.contentFormats.length > 0
        ? [
            sql`${creators.contentFormats} && ARRAY[${sql.join(
              filters.contentFormats.map((c) => sql`${c}`),
              sql`, `,
            )}]::text[]`,
          ]
        : []),
      ...(filters.ethnicity.length > 0
        ? [
            sql`${creators.ethnicity} && ARRAY[${sql.join(
              filters.ethnicity.map((e) => sql`${e}`),
              sql`, `,
            )}]::text[]`,
          ]
        : []),
      ...(filters.socialPlatforms.length > 0
        ? filters.socialPlatforms.map((platform) => {
            const urlKey =
              SOCIAL_PLATFORMS.find((p) => p.value === platform)?.urlKey ?? "instagram_url";
            return sql`${creators.socialChannels}::jsonb ? ${urlKey}`;
          })
        : []),
    ];

    const orderBy =
      sort === "rating"
        ? asc(ratingOrderSql())
        : sort === "newest"
          ? desc(creators.joinedAt)
          : sort === "collaborations"
            ? desc(count(collaborations.id))
            : sort === "rate_low"
              ? asc(sql`(${creators.rateRangeSelf}->>'min')::numeric`)
              : sort === "rate_high"
                ? desc(sql`(${creators.rateRangeSelf}->>'max')::numeric`)
                : asc(ratingOrderSql());

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
      .orderBy(orderBy)
      .limit(PAGE_SIZE + 1)
      .offset(page * PAGE_SIZE);

    const hasMore = rows.length > PAGE_SIZE;
    const slice = rows.slice(0, PAGE_SIZE);

    const parsed = slice.map(({ creator, collabCount }) =>
      creatorSchema.parse({ ...creator, collabCount: collabCount ?? 0 }),
    );

    const list = parsed.map((creator) => ({
      ...creator,
      profilePhotoUrl: toMediaUrl(creator.profilePhoto, creator.profileCompletedAt),
    }));

    return { creators: list, hasMore };
  } catch (err) {
    throw toActionError(err);
  }
}
