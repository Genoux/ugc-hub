import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { creators } from "../core/creators";
import { projects } from "../core/projects";

export const statusEnum = pgEnum("collaboration_status", ["active", "closed"]);

// One collaboration per (creator, project). Has many submissions (content deliveries).
export const collaborations = pgTable(
  "collaborations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name"),

    // Parent references (projectId null = manually logged collaboration)
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),

    // Collaboration tracking
    status: statusEnum("collaboration_status").notNull().default("active"),

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

    // Admin-curated best pieces from this collaboration
    highlights: jsonb("highlights")
      .$type<
        {
          id: string;
          r2Key: string;
          filename: string;
          mimeType: string;
          sizeBytes: number;
          uploadedBy: string;
        }[]
      >()
      .default([]),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("collabs_creator_project_unique_idx")
      .on(t.creatorId, t.projectId)
      .where(sql`${t.projectId} is not null`),
    index("collabs_creator_id_idx").on(t.creatorId),
    index("collabs_status_idx").on(t.status),
  ],
);
