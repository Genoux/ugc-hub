import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local" });
config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_DOMAIN: z.string().min(1, "ALLOWED_DOMAIN is required"),
  APPLY_WEBHOOK_SECRET: z.string().min(1, "APPLY_WEBHOOK_SECRET is required"),
  TYPEFORM_WEBHOOK_SECRET: z.string().min(1, "TYPEFORM_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  SLACK_WEBHOOK_URL: z.url().optional(),
});

export const env = envSchema.parse(process.env);
