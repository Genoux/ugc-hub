import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");
  return { id: userId };
}
