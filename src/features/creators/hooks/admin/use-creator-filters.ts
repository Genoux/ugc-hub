import { useEffect, useState } from "react";
import {
  countActiveFilters,
  emptyFilters,
  type Filters,
  getActiveFilterLabels,
} from "@/features/creators/components/admin/database-filters";

export type SortKey = "rating" | "newest" | "collaborations" | "rate_low" | "rate_high";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Best performers" },
  { key: "newest", label: "Newest" },
  { key: "collaborations", label: "Most collabs" },
  { key: "rate_low", label: "Rate: Low to High" },
  { key: "rate_high", label: "Rate: High to Low" },
];

const DEBOUNCE_MS = 300;

export function useCreatorFilters() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

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
    debouncedSearch,
    sort,
    setSort,
    filters,
    setFilters,
    activeLabels,
    activeCount,
    currentSortLabel,
    removeFilterLabel,
    clearFilters,
  };
}
