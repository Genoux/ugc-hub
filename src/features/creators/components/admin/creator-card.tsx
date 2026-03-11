"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { getCreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import { RatingBadge } from "@/shared/components/blocks/rating-badge";
import { VerifiedBadge } from "@/shared/components/icons/verified-badge";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";
import { ROUTES } from "@/shared/lib/routes";

interface CreatorCardProps {
  creator: CreatorListItem;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const queryClient = useQueryClient();
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
      className="rounded-3xl cursor-pointer group relative h-[400px] aspect-square w-full overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={creator.profilePhotoUrl ?? ""}
          alt={creator.fullName}
          fill
          unoptimized
          placeholder={"blur"}
          loading="eager"
          blurDataURL={creator.profilePhotoBlurDataUrl ?? undefined}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex flex-col bg-linear-to-t from-black/80 from-0% to-transparent to-30% p-4">
          <div className="flex justify-start">
            <RatingBadge rating={creator.overallRating} />
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-xl truncate">{creator.fullName}</h3>
                {creator.overallRating === "top creator" && <VerifiedBadge className="size-5" />}
              </div>
              <div className="text-sm text-left font-semibold text-white/80">{rateDisplay}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
