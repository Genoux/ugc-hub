import { redirect } from "next/navigation";
import { getProjectDetail } from "@/features/projects/actions/get-project-detail";
import { ProjectDetail } from "@/features/projects/components/project-detail";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) redirect("/projects");

  const project = await getProjectDetail(id);
  if (!project) redirect("/projects");

  return <ProjectDetail project={project} />;
}
