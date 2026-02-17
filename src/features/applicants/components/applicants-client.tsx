"use client";

import { useMemo, useState } from "react";
import { ApplicantDetail } from "@/features/applicants/components/applicant-detail";
import { ApplicantList } from "@/features/applicants/components/applicant-list";
import { DirectInviteButton } from "@/features/applicants/components/direct-invite-button";
import type { Creator } from "@/features/applicants/types";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

type TabKey = "applicant" | "profile_review" | "approved_not_joined" | "rejected";

const TABS: { key: TabKey; label: string; tooltip: string }[] = [
  { key: "applicant", label: "New", tooltip: "New applicants waiting for approval" },
  {
    key: "profile_review",
    label: "Profile Review",
    tooltip: "Creators who submitted their minimal profile and are waiting for review",
  },
  {
    key: "approved_not_joined",
    label: "Not joined",
    tooltip: "Creators invited but haven't completed their profile",
  },
  { key: "rejected", label: "Rejected", tooltip: "Rejected applications" },
];

interface Props {
  initialCreators: Creator[];
}

export function ApplicantsClient({ initialCreators }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("applicant");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "applicant":
        return initialCreators.filter((c) => c.status === "applicant");
      case "profile_review":
        return initialCreators.filter(
          (c) => c.status === "under_review" && c.profileReviewStatus === "pending",
        );
      case "approved_not_joined":
        return initialCreators.filter((c) => c.status === "approved_not_joined");
      case "rejected":
        return initialCreators.filter((c) => c.status === "rejected");
    }
  }, [initialCreators, activeTab]);

  const counts = useMemo(
    () => ({
      applicant: initialCreators.filter((c) => c.status === "applicant").length,
      profile_review: initialCreators.filter(
        (c) => c.status === "under_review" && c.profileReviewStatus === "pending",
      ).length,
      approved_not_joined: initialCreators.filter((c) => c.status === "approved_not_joined").length,
      rejected: initialCreators.filter((c) => c.status === "rejected").length,
    }),
    [initialCreators],
  );

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      <header className="px-8 pt-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Creator Applicants
          </h1>
          <DirectInviteButton />
        </div>
      </header>

      <div className="flex flex-1 min-h-0 px-8 gap-6">
        <div className="w-72 lg:w-80 xl:w-96 flex flex-col shrink-0">
          <div className="flex items-center gap-1 mb-4">
            {TABS.map((tab) => (
              <Tooltip key={tab.key}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedId(null);
                    }}
                    className={`px-4 py-1.5 h-auto text-sm rounded-full whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.key !== "rejected" && counts[tab.key] > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {counts[tab.key]}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tab.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {activeTab === "approved_not_joined" && (
            <p className="text-xs text-muted-foreground mb-3 px-1">
              Creators that were invited but still haven't completed their profiles.
            </p>
          )}
          {activeTab === "profile_review" && (
            <p className="text-xs text-muted-foreground mb-3 px-1">
              Creators who submitted their basic profile — review and approve or decline.
            </p>
          )}

          <ApplicantList
            creators={filtered}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        <main className="flex-1 pb-8 min-w-0">
          {selected ? (
            <ApplicantDetail
              creator={selected}
              activeTab={activeTab === "profile_review" ? "profile_review" : selected.status}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No applicants in this tab.
            </div>
          )}
        </main>
      </div>
    </>
  );
}
