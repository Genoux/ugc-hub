import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) redirect(ROUTES.signIn);

  // clerkUserId is synced on first /creator visit, so returning creators are matched instantly
  const creator = await db.query.creators.findFirst({
    where: eq(creators.clerkUserId, userId),
    columns: { id: true },
  });

  if (creator) redirect(ROUTES.creatorHome);

  // Clerk API call deferred to here — only runs for non-creators
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";

  if (email.toLowerCase().endsWith(`@${process.env.ALLOWED_DOMAIN}`)) {
    redirect(ROUTES.adminHome);
  }

  redirect(ROUTES.signIn);
}
