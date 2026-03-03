import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";

export const requireCreator = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const { creator } = await getSessionCreator(userId);
  if (!creator) throw new Error("Creator not found");
  return creator;
});
