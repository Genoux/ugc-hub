"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
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
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/30">
      <div className="z-20 bg-white border-b border-gray-100 px-8 py-5 shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators..."
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-20 text-sm text-gray-400">
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
