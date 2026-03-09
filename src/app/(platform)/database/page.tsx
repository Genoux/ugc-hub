"use client";

import { useQuery } from "@tanstack/react-query";
import { getCreators } from "@/features/creators/actions/admin/get-creators";
import { CreatorDatabase } from "@/features/creators/components/admin/creator-database";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

export default function DatabasePage() {
  const { data: creators, isLoading } = useQuery({
    queryKey: platformQueryKeys.database,
    queryFn: getCreators,
  });

  if (isLoading) return <PageLoader />;

  return <CreatorDatabase creators={creators ?? []} />;
}
