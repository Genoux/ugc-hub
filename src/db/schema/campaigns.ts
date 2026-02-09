import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'

export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'paused', 'completed'])

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  brief: text('brief').notNull(),
  assetRequirements: jsonb('asset_requirements').notNull(),
  status: campaignStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
