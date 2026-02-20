"use client";

import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CreatorProfileAssetsResult } from "@/features/creators/actions/admin/get-creator-profile-assets";
import { getCreatorProfileAssets } from "@/features/creators/actions/admin/get-creator-profile-assets";
import type { OverallRatingTier } from "@/features/creators/constants";
import { OVERALL_RATING_TIERS } from "@/features/creators/constants";
import type { Creator } from "@/features/creators/schemas";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { CreatorCard } from "./creator-card";
import { CreatorOverlay } from "./creator-overlay";
import {
  countActiveFilters,
  DatabaseFilters,
  emptyFilters,
  type Filters,
  getActiveFilterLabels,
  hasActiveFilters,
} from "./database-filters";

type SortKey = "rating" | "newest" | "collaborations" | "rate_low" | "rate_high";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Best performers" },
  { key: "newest", label: "Newest" },
  { key: "collaborations", label: "Most collabs" },
  { key: "rate_low", label: "Rate: Low to High" },
  { key: "rate_high", label: "Rate: High to Low" },
];

const RATING_ORDER: Record<OverallRatingTier, number> = Object.fromEntries(
  OVERALL_RATING_TIERS.map((tier, i) => [tier, i]),
) as Record<OverallRatingTier, number>;

interface CreatorDatabaseProps {
  creators: Creator[];
}

export function CreatorDatabase({ creators }: CreatorDatabaseProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [profileAssets, setProfileAssets] = useState<CreatorProfileAssetsResult | null>(null);
  const assetsCache = useRef(new Map<string, CreatorProfileAssetsResult>());

  useEffect(() => {
    if (!selectedCreatorId) return;
    const cached = assetsCache.current.get(selectedCreatorId);
    if (cached) {
      setProfileAssets(cached);
      return;
    }
    setProfileAssets(null);
    let cancelled = false;
    getCreatorProfileAssets(selectedCreatorId).then((data) => {
      assetsCache.current.set(selectedCreatorId, data);
      if (!cancelled) setProfileAssets(data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedCreatorId]);

  const searched = useMemo(() => {
    if (!search.trim()) return creators;
    const q = search.toLowerCase();
    return creators.filter((c) => c.fullName.toLowerCase().includes(q));
  }, [creators, search]);

  const filtered = useMemo(() => {
    if (!hasActiveFilters(filters)) return searched;
    return searched.filter((c) => {
      if (filters.status.length) {
        const creatorLabel =
          c.status === "blacklisted" ? "blacklisted" : c.collabCount > 0 ? "active" : "untested";
        if (!filters.status.includes(creatorLabel)) return false;
      }
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
        if (!c.genderIdentity || !filters.genderIdentity.includes(c.genderIdentity)) return false;
      }
      if (filters.ageDemographic.length) {
        if (!c.ageDemographic || !filters.ageDemographic.includes(c.ageDemographic)) return false;
      }
      if (filters.ethnicity.length) {
        if (!c.ethnicity || !filters.ethnicity.includes(c.ethnicity)) return false;
      }
      if (filters.hasInstagram && !c.socialChannels?.instagram_handle) return false;
      if (filters.hasTikTok && !c.socialChannels?.tiktok_handle) return false;
      if (filters.hasYouTube && !c.socialChannels?.youtube_handle) return false;
      return true;
    });
  }, [searched, filters]);

  const sorted = useMemo(() => {
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

  const selectedCreator = sorted.find((c) => c.id === selectedCreatorId) ?? null;
  const activeLabels = getActiveFilterLabels(filters);
  const activeCount = countActiveFilters(filters);
  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "Sort";

  const navigateCreator = (direction: 1 | -1) => {
    if (!selectedCreatorId) return;
    const idx = sorted.findIndex((c) => c.id === selectedCreatorId);
    const next = sorted[idx + direction];
    if (next) setSelectedCreatorId(next.id);
  };

  const removeFilterLabel = (label: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.filter((s) => s !== label),
      overallRating: prev.overallRating.filter((s) => s !== label),
      ugcCategories: prev.ugcCategories.filter((s) => s !== label),
      contentFormats: prev.contentFormats.filter((s) => s !== label),
      genderIdentity: prev.genderIdentity.filter((s) => s !== label),
      ageDemographic: prev.ageDemographic.filter((s) => s !== label),
      ethnicity: prev.ethnicity.filter((s) => s !== label),
      hasInstagram: label === "Instagram" ? false : prev.hasInstagram,
      hasTikTok: label === "TikTok" ? false : prev.hasTikTok,
      hasYouTube: label === "YouTube" ? false : prev.hasYouTube,
    }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Top bar: filter toggle + search + sort */}
      <div className="z-20 bg-background border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
        <Button
          type="button"
          variant={filtersOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="shrink-0 gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center bg-background/20">
              {activeCount}
            </span>
          )}
        </Button>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9 h-9"
          />
        </div>

        {/* Sort dropdown */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                {currentSortLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SORT_OPTIONS.map((s) => (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={sort === s.key ? "font-medium" : ""}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filter pills */}
      {activeLabels.length > 0 && (
        <div className="px-6 py-2.5 border-b border-border bg-background shrink-0 flex items-center gap-2 flex-wrap">
          {activeLabels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilterLabel(label)}
            >
              {label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFilters(emptyFilters)}
            className="h-auto px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Body: filter sidebar + grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {filtersOpen && (
          <aside className="flex w-56 shrink-0 flex-col self-stretch min-h-0 overflow-y-auto border-r border-border bg-background p-4 xl:w-64">
            <DatabaseFilters filters={filters} onChange={setFilters} />
          </aside>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No creators
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-7 gap-y-8 p-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {sorted.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onClick={() => setSelectedCreatorId(creator.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCreator && (
        <CreatorOverlay
          creator={selectedCreator}
          creators={sorted}
          profileAssets={profileAssets}
          onClose={() => setSelectedCreatorId(null)}
          onPrev={() => navigateCreator(-1)}
          onNext={() => navigateCreator(1)}
        />
      )}
    </div>
  );
}
