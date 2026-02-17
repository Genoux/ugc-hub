import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");
  return { id: userId };
});

export const isCreator = cache(async () => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "creator";
});

export const getCreatorProfile = cache(async () => {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const creatorId = sessionClaims?.metadata?.creatorId;
  if (!creatorId) return null;

  return { creatorId, userId };
});
