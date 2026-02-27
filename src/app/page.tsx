import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { env } from "@/shared/lib/env";
import { ROUTES } from "@/shared/lib/routes";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  const { creator, email } = await getSessionCreator(userId);

  if (creator) redirect(ROUTES.creatorHome);

  if (email.endsWith(`@${env.ALLOWED_DOMAIN}`)) redirect(ROUTES.adminHome);

  redirect(ROUTES.signOut);
}
