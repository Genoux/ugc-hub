import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { assets, campaigns, submissions } from "@/db/schema";
import { SubmissionReview } from "@/features/submissions/components/submission-review";
import { Button } from "@/shared/components/ui/button";
import { getCurrentUser } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = await params;
  const user = await getCurrentUser();

  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(submissionId)) {
    redirect("/");
  }

  const [campaign, submission, submissionAssets] = await Promise.all([
    db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, id), eq(campaigns.userId, user.id)),
    }),
    db.query.submissions.findFirst({
      where: and(eq(submissions.id, submissionId), eq(submissions.campaignId, id)),
      with: { link: true },
    }),
    db.query.assets.findMany({
      where: eq(assets.submissionId, submissionId),
    }),
  ]);

  if (!campaign) {
    redirect("/");
  }

  if (!submission) {
    redirect(`/campaigns/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Button variant="outline" size="sm" asChild className="w-fit">
        <Link href={`/campaigns/${id}`}>
          <ChevronLeft className="size-4" />
          Submissions
        </Link>
      </Button>

      <SubmissionReview
        campaignName={campaign.name}
        submission={submission}
        assets={submissionAssets}
        submissionLink={submission.link}
      />
    </div>
  );
}
