import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { CreatorPortalShell } from "@/features/creators/components/creator-portal-shell";
import { getCreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { db } from "@/shared/lib/db";

export default async function CreatorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const creator = await db.query.creators.findFirst({
    where: or(eq(creators.clerkUserId, userId), eq(creators.email, email)),
  });

  if (!creator) redirect("/unauthorized");

  const uiState = getCreatorUIState(creator);

  return <CreatorPortalShell creator={creator} uiState={uiState} />;
}
