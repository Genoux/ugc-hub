import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'
import { links } from './links'

export const submissionStatusEnum = pgEnum('submission_status', ['awaiting', 'pending', 'approved', 'rejected'])

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  linkId: uuid('link_id').notNull().unique().references(() => links.id, { onDelete: 'cascade' }),
  creatorName: text('creator_name'),
  creatorEmail: text('creator_email'),
  creatorNotes: text('creator_notes'),
  status: submissionStatusEnum('status').notNull().default('awaiting'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
})
