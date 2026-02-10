-- Drop campaign status column and enum
ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "status";
DROP TYPE IF EXISTS "campaign_status";
