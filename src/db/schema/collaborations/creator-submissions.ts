import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { creatorCollaborations } from "./creator-collaborations";

export const creatorSubmissions = pgTable("creator_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent reference
  creatorCollaborationId: uuid("creator_collaboration_id")
    .notNull()
    .references(() => creatorCollaborations.id, { onDelete: "cascade" }),

  // Batch metadata
  label: text("label").notNull(), // "Submission 1", "Submission 2", etc.
  batchNumber: integer("batch_number").notNull(), // Auto-increment per folder

  // Timestamps
  deliveredAt: timestamp("delivered_at").notNull().defaultNow(),
});
