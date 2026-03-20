"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import { RatingBadge } from "@/shared/components/blocks/rating-badge";
import { VerifiedBadge } from "@/shared/components/icons/verified-badge";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";
import { ROUTES } from "@/shared/lib/routes";

interface CreatorCardProps {
  creator: CreatorListItem;
  priority?: boolean;
}

export function CreatorCard({ creator, priority = false }: CreatorCardProps) {
  const queryClient = useQueryClient();
  const [imageLoaded, setImageLoaded] = useState(false);
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;
  const rateDisplay = rateRange ? `$${rateRange.min}-$${rateRange.max}` : "Rate TBD";

  function prefetch() {
    queryClient.prefetchQuery({
      queryKey: platformQueryKeys.creatorProfile(creator.id),
      queryFn: () => getCreatorProfile(creator.id),
    });
  }

  return (
    <Link
      href={ROUTES.creatorProfile(creator.id)}
      onMouseEnter={prefetch}
      className="rounded-3xl cursor-pointer group relative h-[400px] aspect-square w-full overflow-hidden bg-muted"
    >
      <div className="absolute inset-0 overflow-hidden">
        {creator.profilePhotoUrl && (
          <Image
            src={creator.profilePhotoUrl}
            alt={creator.fullName}
            fill
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
        <div
          className={`absolute inset-0 flex flex-col bg-linear-to-t from-black from-0% to-transparent to-40% p-4 transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex justify-start">
            <RatingBadge rating={creator.overallRating} />
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-xl truncate">{creator.fullName}</h3>
                {creator.overallRating === "top creator" && <VerifiedBadge className="size-5" />}
              </div>
              <p className="text-sm text-left text-white/80">{creator.country}</p>
              <div className="text-sm text-left font-semibold text-white/80">{rateDisplay}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
