import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

// External service errors (Clerk, Stripe, etc.) should be handled in their
// own wrapper modules before reaching here.
export function toActionError(err: unknown): Error {
  if (err instanceof ZodError) {
    const msgs = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return new Error(`Validation failed. ${msgs}`);
  }

  if (err instanceof Error) return err;

  Sentry.captureException(err);
  return new Error("An unexpected error occurred");
}
