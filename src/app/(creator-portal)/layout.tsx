import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { Separator } from "@/shared/components/ui/separator";
import { db } from "@/shared/lib/db";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Not a fan of this. We should be using the sessionClaims metadata to get the creatorId or something
  // Will do for now.
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

  if (!primaryEmail) redirect("/sign-in");

  const creator = await db.query.creators.findFirst({
    where: or(eq(creators.clerkUserId, userId), eq(creators.email, primaryEmail)),
    columns: { id: true, clerkUserId: true, status: true },
  });

  // No creator record means they weren't invited — deny access
  if (!creator) redirect("/unauthorized");

  // Sync clerkUserId and mark as joined on first visit
  if (!creator.clerkUserId) {
    await db
      .update(creators)
      .set({
        clerkUserId: userId,
        status: "joined",
        joinedAt: new Date(),
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
