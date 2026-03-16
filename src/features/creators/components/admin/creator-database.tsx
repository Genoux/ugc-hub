"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { ArrowUpDown, Search, SlidersHorizontal, Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { getCreators } from "@/features/creators/actions/admin/get-creators";
import {
  SORT_OPTIONS,
  useCreatorFilters,
} from "@/features/creators/hooks/admin/use-creator-filters";
import { PageLoader } from "@/shared/components/layout/page-loader";
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
import { LoadMoreSentinel } from "@/shared/components/ui/load-more-sentinel";
import { useInfiniteScroll } from "@/shared/hooks/use-infinite-scroll";
import { EASING_FUNCTION } from "@/shared/lib/constants";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";
import { CreatorCard } from "./creator-card";
import { DatabaseFilters } from "./database-filters";

const ROW_HEIGHT = 408;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function CreatorDatabase() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    search,
    setSearch,
    debouncedSearch,
    sort,
    setSort,
    filters,
    setFilters,
    currentSortLabel,
  } = useCreatorFilters();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: platformQueryKeys.database(filters, sort, debouncedSearch),
    queryFn: ({ pageParam }) =>
      getCreators({
        filters,
        sort,
        search: debouncedSearch,
        page: pageParam,
      }),
    getNextPageParam: (last, all) => (last.hasMore ? all.length : undefined),
    initialPageParam: 0,
  });

  const creators = useMemo(() => data?.pages.flatMap((p) => p.creators) ?? [], [data]);

  const COLUMNS_PER_ROW = 4;
  const rows = useMemo(() => chunk(creators, COLUMNS_PER_ROW), [creators]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: useCallback(() => scrollContainerRef.current, []),
    estimateSize: () => ROW_HEIGHT,
    overscan: 2,
  });

  const sentinelRef = useInfiniteScroll({
    scrollRef: scrollContainerRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="z-20 bg-background border-b border-border px-6 py-3 flex items-stretch gap-3 shrink-0">
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

        <div className="ml-auto flex h-full items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-full gap-1.5">
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

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <motion.aside
          className="absolute inset-y-0 left-0 z-10 w-56 flex flex-col overflow-y-auto bg-background p-4 shadow-xl"
          initial={{ x: "-100%" }}
          animate={{ x: filtersOpen ? 0 : "-100%" }}
          transition={{ duration: 0.2, ease: EASING_FUNCTION.exponential }}
        >
          <DatabaseFilters filters={filters} onChange={setFilters} />
        </motion.aside>
        <AnimatePresence mode="wait">
          <motion.div
            className="absolute inset-0 z-5 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: filtersOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASING_FUNCTION.exponential }}
          />
        </AnimatePresence>
        <button
          type="button"
          className={`flex min-h-0 flex-1 min-w-0 flex-col`}
          onClick={() => filtersOpen && setFiltersOpen(false)}
        >
          <div
            ref={scrollContainerRef}
            className={`flex flex-col flex-1 min-h-0 overflow-y-auto ${filtersOpen ? "pointer-events-none" : "pointer-events-auto"}`}
          >
            {isLoading ? (
              <PageLoader />
            ) : creators.length === 0 ? (
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
              <div className="p-4">
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: "relative",
                    width: "100%",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const rowCreators = rows[virtualRow.index] ?? [];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                          height: `${virtualRow.size}px`,
                        }}
                        className="pb-2"
                      >
                        <div className="grid grid-cols-1 gap-2 h-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {rowCreators.map((creator) => (
                            <CreatorCard key={creator.id} creator={creator} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <LoadMoreSentinel sentinelRef={sentinelRef} isFetching={isFetchingNextPage} />
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
