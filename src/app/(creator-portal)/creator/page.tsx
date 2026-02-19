import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { getCreatorContent } from "@/features/creators/actions/get-creator-content";
import { CreatorPortalShell } from "@/features/creators/components/creator-portal-shell";
import { getCreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export default async function CreatorPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  // Layout already synced clerkUserId on first visit — safe to query by it directly
  const creator = await db.query.creators.findFirst({
    where: eq(creators.clerkUserId, userId),
  });

  if (!creator) redirect(ROUTES.signIn);

  const [uiState, content] = await Promise.all([
    getCreatorUIState(creator),
    getCreatorContent(creator.id),
  ]);

  return <CreatorPortalShell creator={creator} uiState={uiState} content={content} />;
}
