import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import { getCreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { CreatorPortalShell } from "@/features/creators/components/portal/creator-portal-shell";
import { getCreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { ROUTES } from "@/shared/lib/routes";

export default async function CreatorPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  // Layout already guards this route — getSessionCreator() is cached, no second DB query.
  const { creator: row } = await getSessionCreator(userId);
  if (!row) redirect(ROUTES.signOut);

  const [creator, uiState, content] = await Promise.all([
    getCreatorProfile(),
    getCreatorUIState(row),
    getCreatorSubmissions(),
  ]);

  return <CreatorPortalShell creator={creator} uiState={uiState} content={content} />;
}
