import type { creators } from "@/db/schema";

/** Full row type for the creators table */
export type Creator = typeof creators.$inferSelect;

/** Stored shape (DB/API). */
export interface PortfolioVideoEntry {
  id: string;
  r2Key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

/** Resolved for display/download — signed URL attached. */
export interface PortfolioVideo {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface CollaborationHighlight {
  id: string;
  r2Key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
}
