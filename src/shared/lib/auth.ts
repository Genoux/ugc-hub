import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");
  return { id: userId };
});
