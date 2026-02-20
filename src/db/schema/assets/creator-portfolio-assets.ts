import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { creatorFolders } from "../collaborations/creator-folders";
import { creators } from "../core/creators";

export const creatorPortfolioAssets = pgTable("creator_portfolio_assets", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent references
  creatorFolderId: uuid("creator_folder_id")
    .notNull()
    .references(() => creatorFolders.id, { onDelete: "cascade" }),
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
