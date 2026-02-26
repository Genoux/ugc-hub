import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { collaborations } from "./collaborations";

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent reference
  collaborationId: uuid("collaboration_id")
    .notNull()
    .references(() => collaborations.id, { onDelete: "cascade" }),

  // Submission metadata
  label: text("label").notNull(), // "Submission 1", "Submission 2", etc.
  submissionNumber: integer("submission_number").notNull(), // Auto-increment per collaboration

  // Timestamps
  deliveredAt: timestamp("delivered_at").notNull().defaultNow(),
});
