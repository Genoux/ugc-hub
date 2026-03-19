import type { CollabRatingRow } from "@/shared/lib/calculate-ratings";

export type CollaborationDetail = {
  id: string;
  status: "active" | "closed";
  project: { id: string; name: string };
  creator: {
    id: string;
    fullName: string;
    email: string;
    profilePhotoUrl: string | null;
    closedCollabRatings: CollabRatingRow[];
  };
  submissions: Array<{
    id: string;
    label: string;
    submissionNumber: number;
    deliveredAt: Date;
    assets: Array<{
      id: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
    }>;
  }>;
  highlights: Array<{ id: string; filename: string; mimeType: string; url: string }>;
};
