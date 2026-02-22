import { bigint, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { creators } from "../core/creators";

export const creatorProfileAssetTypeEnum = pgEnum("creator_profile_asset_type", [
  "profile_picture",
  "portfolio_video",
  "other",
]);

export const creatorProfileAssets = pgTable("creator_profile_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  assetType: creatorProfileAssetTypeEnum("asset_type").notNull().default("other"),
  r2Key: text("r2_key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
