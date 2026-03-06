import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", ["active", "closed"]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),

  // Identity (Client - SOW format)
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),

  // Upload access
  uploadToken: text("upload_token").notNull().unique(),

  // Requirements
  assetRequirements: jsonb("asset_requirements")
    .$type<{
      acceptedTypes: string[];
      maxFiles: number;
      maxFileSize: number;
    }>()
    .notNull(),

  // Status & tracking
  status: projectStatusEnum("status").notNull().default("active"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});
