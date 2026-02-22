import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { creators } from "@/db/schema";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { CreatorPortalClientShell } from "@/features/creators/components/portal/creator-portal-client-shell";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.signIn);

  const { creator, email } = await getSessionCreator(userId);

  if (!creator) {
    const isAdmin = email.endsWith(`@${process.env.ALLOWED_DOMAIN}`);
    redirect(isAdmin ? ROUTES.adminHome : ROUTES.signOut);
  }

  // Link Clerk account on first visit
  if (!creator.clerkUserId) {
    await db.update(creators).set({ clerkUserId: userId }).where(eq(creators.id, creator.id));
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CreatorPortalClientShell>{children}</CreatorPortalClientShell>
    </ThemeProvider>
  );
}
