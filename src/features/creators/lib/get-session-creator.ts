import { clerkClient } from "@clerk/nextjs/server";
import { eq, ilike, or } from "drizzle-orm";
import { cache } from "react";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

/**
 * Fetches the creator row for the current Clerk session.
 * Wrapped in React.cache() so layout + page share one DB round-trip per request.
 */
export const getSessionCreator = cache(async (userId: string) => {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ?? "";

  const creator = await db.query.creators.findFirst({
    where: or(eq(creators.clerkUserId, userId), ilike(creators.email, email)),
  });

  return { creator: creator ?? null, email, fullName: clerkUser.fullName };
});
