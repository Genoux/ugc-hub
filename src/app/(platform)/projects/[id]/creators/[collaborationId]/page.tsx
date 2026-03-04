import { redirect } from "next/navigation";
import { getCollaborationDetail } from "@/features/projects/actions/get-collaboration-detail";
import { CreatorCollaboration } from "@/features/projects/components/creator-collaboration";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CreatorFolderPage({
  params,
}: {
  params: Promise<{ id: string; collaborationId: string }>;
}) {
  const { id, collaborationId } = await params;

  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(collaborationId)) redirect("/projects");

  const collaboration = await getCollaborationDetail(collaborationId, id);
  if (!collaboration) redirect(`/projects/${id}`);

  return <CreatorCollaboration collaboration={collaboration} />;
}
