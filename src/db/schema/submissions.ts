import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const submissionStatusEnum = pgEnum("submission_status", [
  "active",
  "closed",
]);

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // Admin who created it

  // Identity (Client - SOW format)
  name: text("name").notNull(), // e.g. "Prizepicks - SOW 2"
  code: text("code").notNull(), // e.g. "PRIZ" for quick reference
  description: text("description"),

  // Upload access
  uploadToken: text("upload_token").notNull().unique(),

  // Requirements
  assetRequirements: jsonb("asset_requirements").notNull(),

  // Status & tracking
  status: submissionStatusEnum("status").notNull().default("active"),
  followed: boolean("followed").notNull().default(false), // Admin follow for notifications

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});
