"use client";

import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CreatorProfile,
  getCreatorProfile,
} from "@/features/creators/actions/admin/get-creator-profile";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
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
import { CreatorOverlay } from "./creator-overlay/creator-overlay";
import { DatabaseFilters } from "./database-filters";
import {
  SORT_OPTIONS,
  useCreatorFilters,
} from "@/features/creators/hooks/admin/use-creator-filters";
import { motion } from "framer-motion";
import { EASING_FUNCTION } from "@/shared/lib/constant";
// Module-level cache — persists across component remounts so signed URLs
// remain stable and the browser can serve them from its HTTP cache.
const assetsCache = new Map<string, CreatorProfile>();

interface CreatorDatabaseProps {
  creators: CreatorListItem[];
}

export function CreatorDatabase({ creators }: CreatorDatabaseProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [creator, setCreatorAssets] = useState<CreatorProfile | null>(null);
  const {
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
  } = useCreatorFilters(creators);

  useEffect(() => {
    if (!selectedCreatorId) return;
    const cached = assetsCache.get(selectedCreatorId);
    if (cached) {
      setCreatorAssets(cached);
      return;
    }
    setCreatorAssets(null);
    let cancelled = false;
    getCreatorProfile(selectedCreatorId).then((data) => {
      if (!cancelled) {
        assetsCache.set(selectedCreatorId, data);
        setCreatorAssets(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedCreatorId]);

  const selectedCreatorIdx = selectedCreatorId
    ? sortedCreators.findIndex((c) => c.id === selectedCreatorId)
    : -1;

  const navigateCreator = (direction: 1 | -1) => {
    if (selectedCreatorIdx < 0) return;
    const next = sortedCreators[selectedCreatorIdx + direction];
    if (next) setSelectedCreatorId(next.id);
  };

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
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

      {/* Body: filter sidebar + grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <motion.div
          className="flex shrink-0 flex-col min-h-0 overflow-hidden"
          animate={{ width: filtersOpen ? "14rem" : 0 }}
          transition={{ duration: 0.15, ease: EASING_FUNCTION.exponential }}
        >
          <motion.aside
            className="flex h-full w-56 flex-col overflow-y-auto border-r border-border bg-background p-4"
            animate={{ x: filtersOpen ? 0 : "-100%" }}
            transition={{ duration: 0.15, ease: EASING_FUNCTION.exponential }}
          >
            <DatabaseFilters filters={filters} onChange={setFilters} />
          </motion.aside>
        </motion.div>

        <div className="flex min-h-0 flex-1 min-w-0 flex-col overflow-y-auto">
          {sortedCreators.length === 0
            ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                No creators
              </div>
            )
            : (
              <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
      </div>

      {selectedCreatorId && (
        <CreatorOverlay
          creator={creator}
          hasPrev={selectedCreatorIdx > 0}
          hasNext={selectedCreatorIdx < sortedCreators.length - 1}
          onClose={() => setSelectedCreatorId(null)}
          onPrev={() => navigateCreator(-1)}
          onNext={() => navigateCreator(1)}
        />
      )}
    </div>
  );
}
