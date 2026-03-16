import { parseAsArrayOf, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import {
  countActiveFilters,
  emptyFilters,
  type Filters,
  getActiveFilterLabels,
} from "@/features/creators/components/admin/database-filters";
import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  OverallRatingTier,
  SocialPlatform,
  UgcCategory,
} from "@/shared/lib/constants";
import {
  AGE_DEMOGRAPHICS,
  CONTENT_FORMATS,
  COUNTRIES,
  ETHNICITIES,
  GENDER_IDENTITIES,
  LANGUAGES,
  OVERALL_RATING_TIERS,
  SOCIAL_PLATFORMS,
  UGC_CATEGORIES,
} from "@/shared/lib/constants";

export type SortKey = "rating" | "newest" | "collaborations" | "rate_low" | "rate_high";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Best performers" },
  { key: "newest", label: "Newest" },
  { key: "collaborations", label: "Most collabs" },
  { key: "rate_low", label: "Rate: Low to High" },
  { key: "rate_high", label: "Rate: High to Low" },
];

const DEBOUNCE_MS = 300;

const arrayOf = <T extends string>(values: readonly T[]) =>
  parseAsArrayOf(parseAsStringEnum([...values]));

export function useCreatorFilters() {
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      s: parseAsStringEnum([
        "rating",
        "newest",
        "collaborations",
        "rate_low",
        "rate_high",
      ]).withDefault("rating"),
      rating: arrayOf(OVERALL_RATING_TIERS).withDefault([]),
      ugc: arrayOf(UGC_CATEGORIES).withDefault([]),
      fmt: arrayOf(CONTENT_FORMATS).withDefault([]),
      gender: arrayOf(GENDER_IDENTITIES).withDefault([]),
      age: arrayOf(AGE_DEMOGRAPHICS).withDefault([]),
      eth: arrayOf(ETHNICITIES).withDefault([]),
      ch: arrayOf(SOCIAL_PLATFORMS.map((p) => p.value) as SocialPlatform[]).withDefault([]),
      lang: arrayOf(LANGUAGES).withDefault([]),
      country: arrayOf(COUNTRIES).withDefault([]),
    },
    { history: "replace" },
  );

  const [debouncedSearch, setDebouncedSearch] = useState(params.q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(params.q), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [params.q]);

  const filters: Filters = {
    overallRating: params.rating as OverallRatingTier[],
    ugcCategories: params.ugc as UgcCategory[],
    contentFormats: params.fmt as ContentFormat[],
    genderIdentity: params.gender as GenderIdentity[],
    ageDemographic: params.age as AgeDemographic[],
    ethnicity: params.eth as Ethnicity[],
    socialPlatforms: params.ch as SocialPlatform[],
    languages: params.lang as Language[],
    countries: params.country,
  };

  const setFilters = (f: Filters) =>
    setParams({
      rating: f.overallRating,
      ugc: f.ugcCategories,
      fmt: f.contentFormats,
      gender: f.genderIdentity,
      age: f.ageDemographic,
      eth: f.ethnicity,
      ch: f.socialPlatforms,
      lang: f.languages,
      country: f.countries,
    });

  const activeLabels = getActiveFilterLabels(filters);
  const activeCount = countActiveFilters(filters);
  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === params.s)?.label ?? "Sort";

  const removeFilterLabel = (label: string) => {
    setFilters({
      ...filters,
      overallRating: filters.overallRating.filter((s) => s !== label),
      ugcCategories: filters.ugcCategories.filter((s) => s !== label),
      contentFormats: filters.contentFormats.filter((s) => s !== label),
      genderIdentity: filters.genderIdentity.filter((s) => s !== label),
      ageDemographic: filters.ageDemographic.filter((s) => s !== label),
      ethnicity: filters.ethnicity.filter((s) => s !== label),
      socialPlatforms: filters.socialPlatforms.filter((s) => s !== label),
      languages: filters.languages.filter((s) => s !== label),
      countries: filters.countries.filter((s) => s !== label),
    });
  };

  const clearFilters = () => setFilters(emptyFilters);

  return {
    search: params.q,
    setSearch: (q: string) => setParams({ q }),
    debouncedSearch,
    sort: params.s,
    setSort: (s: SortKey) => setParams({ s }),
    filters,
    setFilters,
    activeLabels,
    activeCount,
    currentSortLabel,
    removeFilterLabel,
    clearFilters,
  };
}
