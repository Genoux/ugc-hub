"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { CreatorProfile } from "@/features/creators/components/admin/creator-profile/creator-profile";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CreatorProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: creator, isLoading } = useQuery({
    queryKey: platformQueryKeys.creatorProfile(id),
    queryFn: () => getCreatorProfile(id),
    enabled: UUID_REGEX.test(id),
  });

  useEffect(() => {
    if (!UUID_REGEX.test(id)) router.replace("/database");
  }, [id, router]);

  useEffect(() => {
    if (!isLoading && creator === null) router.replace("/database");
  }, [isLoading, creator, router]);

  if (isLoading) return <PageLoader />;
  if (!creator) return null;

  return <CreatorProfile creator={creator} />;
}
