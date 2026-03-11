"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ApplicantDetail } from "@/features/applicants/components/applicant-detail";
import { ApplicantList } from "@/features/applicants/components/applicant-list";
import { DirectInviteButton } from "@/features/applicants/components/direct-invite-button";
import type { Creator } from "@/features/applicants/types";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { NumberDot } from "@/shared/components/ui/number-dot";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

export type SortKey = "newest" | "oldest" | "name";

type TabKey = "applicant" | "approved_not_joined" | "rejected";

const TABS: { key: TabKey; label: string }[] = [
  { key: "applicant", label: "New" },
  { key: "approved_not_joined", label: "Not joined" },
  { key: "rejected", label: "Rejected" },
];

const EMPTY_MESSAGES: Record<TabKey, { title: string; description: string }> = {
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

interface Props {
  creators: Creator[];
}

export function ApplicantsClient({ creators }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("applicant");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "applicant":
        return creators.filter((c) => c.status === "applicant");
      case "approved_not_joined":
        return creators.filter((c) => c.status === "approved_not_joined");
      case "rejected":
        return creators.filter((c) => c.status === "rejected");
    }
  }, [creators, activeTab]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "newest")
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      if (sort === "oldest")
        return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
      return (a.fullName || a.email).localeCompare(b.fullName || b.email);
    });
  }, [filtered, sort]);

  const counts = useMemo(
    () => ({
      applicant: creators.filter((c) => c.status === "applicant").length,
      approved_not_joined: creators.filter((c) => c.status === "approved_not_joined").length,
      rejected: creators.filter((c) => c.status === "rejected").length,
    }),
    [creators],
  );

  const selected = sorted.find((c) => c.id === selectedId) ?? null;
  const desktopSelected = selected ?? sorted[0] ?? null;

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabKey);
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
        {sorted.length === 0 ? (
          emptyState
        ) : (
          <>
            <ApplicantList
              creators={sorted}
              selectedId={selected?.id ?? null}
              onSelect={handleMobileSelect}
              sort={sort}
              onSortChange={setSort}
            />
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
              <SheetContent
                side="bottom"
                className="h-[85vh] overflow-y-auto px-4 pt-6"
                showCloseButton={false}
              >
                {selected && <ApplicantDetail creator={selected} activeTab={selected.status} />}
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 gap-4">
        <div className="shrink-0">{tabBar}</div>
        {sorted.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <ApplicantList
              creators={sorted}
              selectedId={desktopSelected?.id ?? null}
              onSelect={setSelectedId}
              sort={sort}
              onSortChange={setSort}
            />
            <main className="flex flex-col pb-8 min-w-0 min-h-0">
              {desktopSelected && (
                <ApplicantDetail creator={desktopSelected} activeTab={desktopSelected.status} />
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
