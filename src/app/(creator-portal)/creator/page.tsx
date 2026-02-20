import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { getCreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { CreatorPortalShell } from "@/features/creators/components/portal/creator-portal-shell";
import { getCreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { creatorSchema } from "@/features/creators/schemas";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export default async function CreatorPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  const row = await db.query.creators.findFirst({
    where: eq(creators.clerkUserId, userId),
  });

  if (!row) redirect(ROUTES.signIn);

  const creator = creatorSchema.parse(row);
  const [uiState, content] = await Promise.all([
    getCreatorUIState(row),
    getCreatorSubmissions(row.id),
  ]);

  return <CreatorPortalShell creator={creator} uiState={uiState} content={content} />;
}
