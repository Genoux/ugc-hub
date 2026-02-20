import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { creatorFolders } from "./creator-folders";

export const creatorSubmissions = pgTable("creator_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent reference
  creatorFolderId: uuid("creator_folder_id")
    .notNull()
    .references(() => creatorFolders.id, { onDelete: "cascade" }),

  // Batch metadata
  label: text("label").notNull(), // "Submission 1", "Submission 2", etc.
  batchNumber: integer("batch_number").notNull(), // Auto-increment per folder

  // Timestamps
  deliveredAt: timestamp("delivered_at").notNull().defaultNow(),
});
