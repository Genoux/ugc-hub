import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'
import { links } from './links'

export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'approved', 'rejected'])

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  creatorName: text('creator_name').notNull(),
  creatorEmail: text('creator_email').notNull(),
  creatorNotes: text('creator_notes'),
  status: submissionStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
})
