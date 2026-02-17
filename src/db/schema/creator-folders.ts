import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { submissions } from "./submissions";
import { creators } from "./creators";

export const collaborationStatusEnum = pgEnum("collaboration_status", ["active", "closed"]);

export const creatorFolders = pgTable("creator_folders", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Parent references
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),

  // Collaboration tracking
  collaborationStatus: collaborationStatusEnum("collaboration_status").notNull().default("active"),

  // Closure details (filled when collaboration is closed)
  closedAt: timestamp("closed_at"),
  closedBy: text("closed_by"), // Admin user ID
  closureNotes: text("closure_notes"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
