import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { Separator } from "@/shared/components/ui/separator";
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

  if (!creator.clerkUserId || creator.status === "approved_not_joined") {
    await db
      .update(creators)
      .set({
        clerkUserId: userId,
        status: "joined",
        joinedAt: creator.joinedAt ?? new Date(),
      })
      .where(eq(creators.id, creator.id));
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between px-6">
        <span className="text-sm font-semibold tracking-tight">pool</span>
        <UserButton />
      </header>
      <Separator />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
