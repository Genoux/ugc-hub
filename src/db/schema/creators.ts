import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const creatorStatusEnum = pgEnum("creator_status", [
  "applicant",
  "approved_not_joined",
  "under_review",
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
  profileCompleted: boolean("profile_completed").notNull().default(false),

  // Basic info (Steps 1-2: Minimal wizard)
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  country: text("country"),
  languages: jsonb("languages").$type<Array<{ language: string; accent?: string }>>(),
  portfolioUrl: text("portfolio_url"),
  
  // Social channels (Steps 1-2)
  socialChannels: jsonb("social_channels").$type<{
    instagram_handle?: string;
    tiktok_handle?: string;
    youtube_handle?: string;
    other_links?: string[];
  }>(),

  // Full profile (Steps 3-9: Complete profile)
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

  // Performance & status (Admin-managed)
  overallRating: text("overall_rating").notNull().default("untested"),

  // Collaboration history
  collaborations: jsonb("collaborations").$type<Array<{
    id: string;
    creator_id: string;
    brand: string;
    date: string;
    pieces_of_content: number;
    total_paid: number;
    per_piece_rate: number;
    notes?: string;
    ratings: {
      visual_quality: string;
      acting_line_delivery: string;
      reliability_speed: string;
    };
    content_thumbnails?: string[];
  }>>().default([]),

  // Blacklist info
  blacklistReason: text("blacklist_reason"),
  blacklistedAt: timestamp("blacklisted_at"),
  blacklistedBy: text("blacklisted_by"),

  // Timestamps
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  joinedAt: timestamp("joined_at"),
  profileCompletedAt: timestamp("profile_completed_at"),
});
