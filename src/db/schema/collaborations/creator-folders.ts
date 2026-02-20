import { integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { creators } from "../core/creators";
import { submissions } from "../core/submissions";

export const collaborationStatusEnum = pgEnum("collaboration_status", ["active", "closed"]);

// One folder per (creator, submission). Folder has many creator_submissions (batches).
// Creators can keep uploading batches even when collaborationStatus is closed.
export const creatorFolders = pgTable(
  "creator_folders",
  {
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

    // Collaboration review data (filled when closing the collaboration)
    ratingVisualQuality: text("rating_visual_quality"),
    ratingActingDelivery: text("rating_acting_delivery"),
    ratingReliabilitySpeed: text("rating_reliability_speed"),
    piecesOfContent: integer("pieces_of_content"),
    totalPaid: integer("total_paid"), // Stored in cents
    reviewNotes: text("review_notes"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("creator_folders_creator_submission_unique").on(t.creatorId, t.submissionId)],
);
