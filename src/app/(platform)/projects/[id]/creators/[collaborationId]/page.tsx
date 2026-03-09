"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCollaborationDetail } from "@/features/projects/actions/get-collaboration-detail";
import { CreatorCollaboration } from "@/features/projects/components/creator-collaboration";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CreatorFolderPage() {
  const router = useRouter();
  const { id, collaborationId } = useParams<{ id: string; collaborationId: string }>();

  const validParams = UUID_REGEX.test(id) && UUID_REGEX.test(collaborationId);

  const { data: collaboration, isLoading } = useQuery({
    queryKey: platformQueryKeys.collaborationDetail(id, collaborationId),
    queryFn: () => getCollaborationDetail(collaborationId, id),
    enabled: validParams,
  });

  useEffect(() => {
    if (!validParams) router.replace("/projects");
  }, [validParams, router]);

  useEffect(() => {
    if (!isLoading && collaboration === null) router.replace(`/projects/${id}`);
  }, [isLoading, collaboration, id, router]);

  if (isLoading) return <PageLoader />;
  if (!collaboration) return null;

  return <CreatorCollaboration collaboration={collaboration} />;
}
