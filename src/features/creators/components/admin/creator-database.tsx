"use client";

import { motion } from "framer-motion";
import { ArrowUpDown, Search, SlidersHorizontal, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CreatorProfile,
  getCreatorProfile,
} from "@/features/creators/actions/admin/get-creator-profile";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import {
  SORT_OPTIONS,
  useCreatorFilters,
} from "@/features/creators/hooks/admin/use-creator-filters";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import { EASING_FUNCTION } from "@/shared/lib/constants";
import { CreatorCard } from "./creator-card";
import { CreatorOverlay } from "./creator-overlay/creator-overlay";
import { DatabaseFilters } from "./database-filters";

interface CreatorDatabaseProps {
  creators: CreatorListItem[];
}

export function CreatorDatabase({ creators }: CreatorDatabaseProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [creator, setCreatorAssets] = useState<CreatorProfile | null>(null);
  const {
    search,
    setSearch,
    sort,
    setSort,
    filters,
    setFilters,
    sortedCreators,
    currentSortLabel,
  } = useCreatorFilters(creators);

  useEffect(() => {
    if (!selectedCreatorId) return;
    setCreatorAssets(null);
    getCreatorProfile(selectedCreatorId).then(setCreatorAssets);
  }, [selectedCreatorId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Top bar: filter toggle + search + sort */}
      <div className="z-20 bg-background border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
        <Button
          type="button"
          variant={filtersOpen ? "default" : "outline"}
          size="icon"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="size-8"
        >
          <SlidersHorizontal className="size-4" />
        </Button>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9 h-9 rounded-full"
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

      {/* Body: filter overlays content; content always full width */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Filter: overlay from left, shadow only */}
        <motion.aside
          className="absolute inset-y-0 left-0 z-10 w-56 flex flex-col overflow-y-auto bg-background p-4 shadow-xl"
          initial={{ x: "-100%" }}
          animate={{ x: filtersOpen ? 0 : "-100%" }}
          transition={{ duration: 0.2, ease: EASING_FUNCTION.exponential }}
        >
          <DatabaseFilters filters={filters} onChange={setFilters} />
        </motion.aside>

        <button
          type="button"
          className={`flex min-h-0 flex-1 min-w-0 flex-col overflow-y-auto transition-[filter] duration-200 ${filtersOpen ? "blur-sm overflow-hidden" : ""}`}
          onClick={() => filtersOpen && setFiltersOpen(false)}
        >
          <div
            className={`flex flex-1 flex-col min-h-0 ${filtersOpen ? "pointer-events-none" : "pointer-events-auto"}`}
          >
            {sortedCreators.length === 0 ? (
            <div className="flex flex-1 p-6">
                <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users size={16} />
                  </EmptyMedia>
                  <EmptyTitle>No creators found</EmptyTitle>
                  <EmptyDescription>Try adjusting your filters or search query.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {sortedCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onClick={() => setSelectedCreatorId(creator.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      </div>

      {selectedCreatorId && (
        <CreatorOverlay creator={creator} onClose={() => setSelectedCreatorId(null)} />
      )}
    </div>
  );
}
