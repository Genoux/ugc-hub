import type { creators } from "@/db/schema";

/** Full row type for the creators table */
export type Creator = typeof creators.$inferSelect;

