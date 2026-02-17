import type { creators } from "@/db/schema";

type Creator = Pick<
  creators,
  "source" | "status" | "minimalProfileCompleted" | "profileCompleted" | "profileReviewStatus"
>;

export type CreatorUIState =
  | "onboarding"
  | "direct_invite_pending"
  | "under_review"
  | "approved_incomplete"
  | "live"
  | "declined";

export function getCreatorUIState(creator: Creator): CreatorUIState {
  if (creator.source === "direct_invite") {
    return creator.profileCompleted ? "live" : "direct_invite_pending";
  }

  // applicant | submission_link
  if (creator.status === "rejected") return "declined";
  if (!creator.minimalProfileCompleted) return "onboarding";
  if (creator.profileReviewStatus === "declined") return "declined";
  if (creator.profileReviewStatus === "pending") return "under_review";
  if (creator.profileReviewStatus === "approved" && !creator.profileCompleted)
    return "approved_incomplete";
  return "live";
}
