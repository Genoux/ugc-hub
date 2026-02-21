import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { creators } from "@/db/schema";
import { CreatorPortalClientShell } from "@/features/creators/components/portal/creator-portal-client-shell";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

  if (!primaryEmail) redirect(ROUTES.signIn);

  const creator = await db.query.creators.findFirst({
    where: or(eq(creators.clerkUserId, userId), eq(creators.email, primaryEmail)),
    columns: { id: true, clerkUserId: true, status: true, joinedAt: true },
  });

  if (!creator) {
    const isAdmin = primaryEmail.toLowerCase().endsWith(`@${process.env.ALLOWED_DOMAIN}`);
    redirect(isAdmin ? ROUTES.adminHome : ROUTES.signIn);
  }

  // Link Clerk account on first visit; status stays approved_not_joined until profile is completed
  if (!creator.clerkUserId) {
    await db
      .update(creators)
      .set({ clerkUserId: userId })
      .where(eq(creators.id, creator.id));
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CreatorPortalClientShell>{children}</CreatorPortalClientShell>
    </ThemeProvider>
  );
}
