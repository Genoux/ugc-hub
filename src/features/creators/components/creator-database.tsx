"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import type { Creator } from "../schemas";
import { CreatorCard } from "./creator-card";
import { CreatorOverlay } from "./creator-overlay";

interface CreatorDatabaseProps {
  creators: Creator[];
}

export function CreatorDatabase({ creators }: CreatorDatabaseProps) {
  const [search, setSearch] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return creators;
    const q = search.toLowerCase();
    return creators.filter((c) => c.fullName.toLowerCase().includes(q));
  }, [creators, search]);

  const selectedCreator = filtered.find((c) => c.id === selectedCreatorId) ?? null;

  const navigateCreator = (direction: 1 | -1) => {
    if (!selectedCreatorId) return;
    const idx = filtered.findIndex((c) => c.id === selectedCreatorId);
    const next = filtered[idx + direction];
    if (next) setSelectedCreatorId(next.id);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <header className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Creator Database
          </h1>
          <div className="relative max-w-sm w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-16 text-sm text-muted-foreground">
              No creators match your search.
            </div>
          ) : (
            filtered.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onClick={() => setSelectedCreatorId(creator.id)}
              />
            ))
          )}
        </div>
      </div>

      {selectedCreator && (
        <CreatorOverlay
          creator={selectedCreator}
          creators={filtered}
          onClose={() => setSelectedCreatorId(null)}
          onPrev={() => navigateCreator(-1)}
          onNext={() => navigateCreator(1)}
        />
      )}
    </div>
  );
}
