import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { creatorCollaborations } from "../collaborations/creator-collaborations";
import { creators } from "../core/creators";

export const creatorPortfolioAssets = pgTable("creator_portfolio_assets", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent references
  creatorCollaborationId: uuid("creator_collaboration_id")
    .notNull()
    .references(() => creatorCollaborations.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),

  // R2 storage
  r2Key: text("r2_key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),

  // Admin tracking
  uploadedBy: text("uploaded_by").notNull(), // Admin Clerk user ID

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
