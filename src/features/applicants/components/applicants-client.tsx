"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { getApplicantCounts, getApplicants } from "@/features/applicants/actions/get-applicants";
import { ApplicantDetail } from "@/features/applicants/components/applicant-detail";
import { ApplicantList } from "@/features/applicants/components/applicant-list";
import { DirectInviteButton } from "@/features/applicants/components/direct-invite-button";
import type { ApplicantTabKey, SortKey } from "@/features/applicants/types";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { LoadMoreSentinel } from "@/shared/components/ui/load-more-sentinel";
import { NumberDot } from "@/shared/components/ui/number-dot";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { useInfiniteScroll } from "@/shared/hooks/use-infinite-scroll";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";
import { cn } from "@/shared/lib/utils";

const TABS: { key: ApplicantTabKey; label: string }[] = [
  { key: "applicant", label: "New" },
  { key: "approved_not_joined", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

const EMPTY_MESSAGES: Record<ApplicantTabKey, { title: string; description: string }> = {
  applicant: {
    title: "No new applicants",
    description: "New applications will appear here when creators apply.",
  },
  approved_not_joined: {
    title: "No pending invitations",
    description: "Invited creators who haven't joined yet will appear here.",
  },
  rejected: {
    title: "No rejected applications",
    description: "Rejected applications will appear here.",
  },
};

export function ApplicantsClient() {
  const [activeTab, setActiveTab] = useState<ApplicantTabKey>("applicant");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: countsData } = useQuery({
    queryKey: platformQueryKeys.applicantCounts,
    queryFn: getApplicantCounts,
  });

  const counts = useMemo(
    () => ({
      applicant: countsData?.applicant ?? 0,
      approved_not_joined: countsData?.approved_not_joined ?? 0,
      rejected: countsData?.rejected ?? 0,
    }),
    [countsData],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: platformQueryKeys.applicants(activeTab, sort),
    queryFn: ({ pageParam }) => getApplicants({ status: activeTab, sort, page: pageParam }),
    getNextPageParam: (last, all) => (last.hasMore ? all.length : undefined),
    initialPageParam: 0,
  });

  const creators = useMemo(() => data?.pages.flatMap((p) => p.creators) ?? [], [data]);

  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileSentinelRef = useInfiniteScroll({
    scrollRef: mobileScrollRef,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });
  const desktopSentinelRef = useInfiniteScroll({
    scrollRef: desktopScrollRef,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const selected = creators.find((c) => c.id === selectedId) ?? null;
  const desktopSelected = selected ?? creators[0] ?? null;

  const handleTabChange = (value: string) => {
    setActiveTab(value as ApplicantTabKey);
    setSelectedId(null);
  };

  const handleMutationSuccess = (destinationTab: ApplicantTabKey) => {
    setActiveTab(destinationTab);
    setSelectedId(null);
  };

  const handleMobileSelect = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const emptyState = (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users size={16} />
        </EmptyMedia>
        <EmptyTitle>{EMPTY_MESSAGES[activeTab].title}</EmptyTitle>
        <EmptyDescription>{EMPTY_MESSAGES[activeTab].description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  const tabBar = (
    <div className="flex gap-1">
      {TABS.map((tab) => (
        <Button
          key={tab.key}
          variant="ghost"
          className={cn(
            "gap-1.5",
            activeTab === tab.key && "bg-secondary text-secondary-foreground",
          )}
          onClick={() => handleTabChange(tab.key)}
        >
          {tab.label}
          {tab.key !== "rejected" && counts[tab.key] > 0 && <NumberDot count={counts[tab.key]} />}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6 p-6">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Creator Applicants</h1>
          <DirectInviteButton />
        </div>
      </header>

      {/* Mobile layout */}
      <div className="flex flex-col flex-1 min-h-0 md:hidden gap-4">
        <div className="shrink-0">{tabBar}</div>
        {isLoading ? (
          <PageLoader />
        ) : creators.length === 0 ? (
          emptyState
        ) : (
          <>
            <div ref={mobileScrollRef} className="flex-1 min-h-0 overflow-y-auto">
              <ApplicantList
                creators={creators}
                selectedId={selected?.id ?? null}
                onSelect={handleMobileSelect}
                sort={sort}
                onSortChange={setSort}
              />
              <LoadMoreSentinel sentinelRef={mobileSentinelRef} isFetching={isFetchingNextPage} />
            </div>
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
              <SheetContent
                side="bottom"
                className="h-[85vh] overflow-y-auto px-4 pt-6"
                showCloseButton={false}
              >
                {selected && (
                  <ApplicantDetail
                    creator={selected}
                    activeTab={selected.status}
                    onMutationSuccess={handleMutationSuccess}
                  />
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 gap-4">
        <div className="shrink-0">{tabBar}</div>
        {isLoading ? (
          <PageLoader />
        ) : creators.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <div ref={desktopScrollRef} className="flex flex-col min-h-0 min-w-0 overflow-y-auto">
              <ApplicantList
                creators={creators}
                selectedId={desktopSelected?.id ?? null}
                onSelect={setSelectedId}
                sort={sort}
                onSortChange={setSort}
              />
              <LoadMoreSentinel sentinelRef={desktopSentinelRef} isFetching={isFetchingNextPage} />
            </div>
            <main className="flex flex-col pb-8 min-w-0 min-h-0">
              {desktopSelected && (
                <ApplicantDetail
                  creator={desktopSelected}
                  activeTab={desktopSelected.status}
                  onMutationSuccess={handleMutationSuccess}
                />
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
