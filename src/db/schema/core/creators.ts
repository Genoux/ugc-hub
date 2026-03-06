import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const creatorStatusEnum = pgEnum("creator_status", [
  "applicant",
  "approved_not_joined",
  "joined",
  "rejected",
  "blacklisted",
]);

export const creators = pgTable("creators", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Clerk integration
  clerkUserId: text("clerk_user_id").unique(),

  // Lifecycle
  status: creatorStatusEnum("status").notNull().default("applicant"),
  source: text("source").$type<"applicant" | "direct_invite" | "submission_link">(),
  profileCompleted: boolean("profile_completed").notNull().default(false),

  // Basic info (Steps 1-2)
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  country: text("country"),
  languages: jsonb("languages").$type<string[]>(),
  portfolioUrl: text("portfolio_url"),

  // Social channels
  socialChannels: jsonb("social_channels").$type<{
    instagram_handle?: string;
    tiktok_handle?: string;
    youtube_handle?: string;
    other_links?: string[];
  }>(),

  // Full profile (Steps 3-9)
  profilePhoto: text("profile_photo"),
  genderIdentity: text("gender_identity"),
  ageDemographic: text("age_demographic"),
  ethnicity: text("ethnicity"),
  primaryChannel: text("primary_channel"), // "Instagram" | "TikTok" | "YouTube"

  // Content specialization
  ugcCategories: text("ugc_categories").array(),
  contentFormats: text("content_formats").array(),

  // Rates
  rateRangeSelf: jsonb("rate_range_self").$type<{ min: number; max: number }>(),
  rateRangeInternal: jsonb("rate_range_internal").$type<{ min: number; max: number }>(),

  // Creator-uploaded portfolio videos (showreel)
  portfolioVideos: jsonb("portfolio_videos")
    .$type<
      {
        id: string;
        r2Key: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
      }[]
    >()
    .default([]),

  // Performance & status (Admin-managed)
  overallRating: text("overall_rating").notNull().default("untested"),

  // Blacklist info
  blacklistReason: text("blacklist_reason"),
  blacklistedAt: timestamp("blacklisted_at"),
  blacklistedBy: text("blacklisted_by"),

  // Timestamps
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  invitedAt: timestamp("invited_at"),
  approvedAt: timestamp("approved_at"),
  joinedAt: timestamp("joined_at"),
  profileCompletedAt: timestamp("profile_completed_at"),
});
