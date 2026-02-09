import { pgTable, uuid, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { submissions } from './submissions'

export const assetUploadStatusEnum = pgEnum('asset_upload_status', ['uploading', 'completed', 'failed'])

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  r2Key: text('r2_key').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  uploadStatus: assetUploadStatusEnum('upload_status').notNull().default('uploading'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
