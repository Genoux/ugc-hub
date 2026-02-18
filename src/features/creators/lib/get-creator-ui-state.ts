import type { creators } from "@/db/schema";

type Creator = Pick<typeof creators.$inferSelect, "status" | "profileCompleted">;

export type CreatorUIState = "pending_approval" | "pending_profile" | "live" | "declined";

export function getCreatorUIState(creator: Creator): CreatorUIState {
  if (creator.status === "rejected") return "declined";
  if (creator.status === "applicant") return "pending_approval";
  if (!creator.profileCompleted) return "pending_profile";
  return "live";
}
