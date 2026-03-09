"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProjectDetail } from "@/features/projects/actions/get-project-detail";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: platformQueryKeys.projectDetail(id),
    queryFn: () => getProjectDetail(id),
    enabled: UUID_REGEX.test(id),
  });

  useEffect(() => {
    if (!UUID_REGEX.test(id)) router.replace("/projects");
  }, [id, router]);

  useEffect(() => {
    if (!isLoading && project === null) router.replace("/projects");
  }, [isLoading, project, router]);

  if (isLoading) return <PageLoader />;
  if (!project) return null;

  return <ProjectDetail project={project} />;
}
