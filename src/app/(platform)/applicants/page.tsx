import { inArray } from "drizzle-orm";
import { creators } from "@/db/schema";
import { ApplicantsClient } from "@/features/applicants/components/applicants-client";
import { db } from "@/shared/lib/db";

export default async function ApplicantsPage() {
  const allCreators = await db
    .select()
    .from(creators)
    .where(
      inArray(creators.status, ["applicant", "approved_not_joined", "rejected"]),
    )
    .orderBy(creators.appliedAt);

  return <ApplicantsClient initialCreators={allCreators} />;
}
