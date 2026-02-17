import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  // Check if this user has a creator record (by clerkUserId or email)
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

  if (primaryEmail) {
    const creator = await db.query.creators.findFirst({
      where: or(
        eq(creators.clerkUserId, userId),
        eq(creators.email, primaryEmail),
      ),
      columns: { id: true },
    });

    if (creator) redirect("/creator");
  }

  redirect("/submissions");
}
