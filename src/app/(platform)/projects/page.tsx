"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectsList } from "@/features/projects/actions/get-projects-list";
import { ProjectList } from "@/features/projects/components/project-list";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: platformQueryKeys.projects,
    queryFn: getProjectsList,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6 flex-1 p-8">
      <ProjectList projects={projects ?? []} />
    </div>
  );
}
