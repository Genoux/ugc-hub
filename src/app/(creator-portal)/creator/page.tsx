import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import { getCreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { CreatorPortalShell } from "@/features/creators/components/portal/creator-portal-shell";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { ROUTES } from "@/shared/lib/routes";

function toCreatorUIState(row: { status: string; profileCompleted: boolean }) {
  if (row.status === "rejected") return "declined" as const;
  if (row.status === "applicant") return "pending_approval" as const;
  if (!row.profileCompleted) return "pending_profile" as const;
  return "live" as const;
}

export default async function CreatorPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  const { creator: row } = await getSessionCreator(userId);
  if (!row) redirect(ROUTES.signOut);

  const [creator, content] = await Promise.all([
    getCreatorProfile(),
    getCreatorSubmissions(),
  ]);
  const uiState = toCreatorUIState(row);

  return <CreatorPortalShell creator={creator} uiState={uiState} content={content} />;
}
