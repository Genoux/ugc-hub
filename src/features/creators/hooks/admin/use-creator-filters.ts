import { useMemo, useState } from "react";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import {
  countActiveFilters,
  emptyFilters,
  type Filters,
  getActiveFilterLabels,
  hasActiveFilters,
} from "@/features/creators/components/admin/database-filters";
import type { OverallRatingTier } from "@/shared/lib/constants";
import { OVERALL_RATING_TIERS, SOCIAL_PLATFORMS } from "@/shared/lib/constants";

export type SortKey = "rating" | "newest" | "collaborations" | "rate_low" | "rate_high";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Best performers" },
  { key: "newest", label: "Newest" },
  { key: "collaborations", label: "Most collabs" },
  { key: "rate_low", label: "Rate: Low to High" },
  { key: "rate_high", label: "Rate: High to Low" },
];

const RATING_ORDER: Record<OverallRatingTier, number> = Object.fromEntries(
  OVERALL_RATING_TIERS.map((tier, i) => [tier, i]),
) as Record<OverallRatingTier, number>;

export function useCreatorFilters(creators: CreatorListItem[]) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const searched = useMemo(() => {
    if (!search.trim()) return creators;
    const q = search.toLowerCase();
    return creators.filter((c) => c.fullName.toLowerCase().includes(q));
  }, [creators, search]);

  const filtered = useMemo(() => {
    if (!hasActiveFilters(filters)) return searched;
    return searched.filter((c) => {
      if (filters.overallRating.length && !filters.overallRating.includes(c.overallRating))
        return false;
      if (
        filters.ugcCategories.length &&
        !filters.ugcCategories.some((cat) => c.ugcCategories?.includes(cat))
      )
        return false;
      if (
        filters.contentFormats.length &&
        !filters.contentFormats.some((f) => c.contentFormats?.includes(f))
      )
        return false;
      if (filters.genderIdentity.length) {
        if (!c.genderIdentity || !filters.genderIdentity.includes(c.genderIdentity as never))
          return false;
      }
      if (filters.ageDemographic.length) {
        if (!c.ageDemographic || !filters.ageDemographic.includes(c.ageDemographic as never))
          return false;
      }
      if (filters.ethnicity.length) {
        if (!c.ethnicity?.some((e) => filters.ethnicity.includes(e as never))) return false;
      }
      if (
        filters.socialPlatforms.length &&
        !filters.socialPlatforms.every((p) => {
          const key = SOCIAL_PLATFORMS.find((sp) => sp.value === p)?.urlKey;
          return c.socialChannels?.[key as keyof typeof c.socialChannels];
        })
      )
        return false;
      return true;
    });
  }, [searched, filters]);

  const sortedCreators = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "rating":
        return arr.sort(
          (a, b) => (RATING_ORDER[a.overallRating] ?? 6) - (RATING_ORDER[b.overallRating] ?? 6),
        );
      case "newest":
        return arr.sort((a, b) => (b.joinedAt?.getTime() ?? 0) - (a.joinedAt?.getTime() ?? 0));
      case "collaborations":
        return arr.sort((a, b) => b.collabCount - a.collabCount);
      case "rate_low":
        return arr.sort((a, b) => (a.rateRangeSelf?.min ?? 0) - (b.rateRangeSelf?.min ?? 0));
      case "rate_high":
        return arr.sort((a, b) => (b.rateRangeSelf?.max ?? 0) - (a.rateRangeSelf?.max ?? 0));
      default:
        return arr;
    }
  }, [filtered, sort]);

  const activeLabels = getActiveFilterLabels(filters);
  const activeCount = countActiveFilters(filters);
  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "Sort";

  const removeFilterLabel = (label: string) => {
    setFilters((prev) => ({
      ...prev,
      overallRating: prev.overallRating.filter((s) => s !== label),
      ugcCategories: prev.ugcCategories.filter((s) => s !== label),
      contentFormats: prev.contentFormats.filter((s) => s !== label),
      genderIdentity: prev.genderIdentity.filter((s) => s !== label),
      ageDemographic: prev.ageDemographic.filter((s) => s !== label),
      ethnicity: prev.ethnicity.filter((s) => s !== label),
      socialPlatforms: prev.socialPlatforms.filter((s) => s !== label),
    }));
  };

  const clearFilters = () => setFilters(emptyFilters);

  return {
    search,
    setSearch,
    sort,
    setSort,
    filters,
    setFilters,
    sortedCreators,
    activeLabels,
    activeCount,
    currentSortLabel,
    removeFilterLabel,
    clearFilters,
  };
}
