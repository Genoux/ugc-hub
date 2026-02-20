import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");
  return { id: userId };
});

export const requireAdmin = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  if (!email.toLowerCase().endsWith(`@${process.env.ALLOWED_DOMAIN}`)) {
    throw new Error("Forbidden");
  }
  return { userId };
});
