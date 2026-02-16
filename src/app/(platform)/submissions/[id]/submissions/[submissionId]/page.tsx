import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { assets, creatorSubmissions, submissions } from "@/db/schema";
import { SubmissionReview } from "@/features/batches/components/submission-review";
import { Button } from "@/shared/components/ui/button";
import { db } from "@/shared/lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = await params;

  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(submissionId)) {
    redirect("/");
  }

  // Middleware already checked domain - fetch submission
  const [submission, batch, batchAssets] = await Promise.all([
    db.query.submissions.findFirst({
      where: eq(submissions.id, id),
    }),
    db.query.creatorSubmissions.findFirst({
      where: eq(creatorSubmissions.id, submissionId),
      with: {
        creatorFolder: {
          with: {
            creator: true,
          },
        },
      },
    }),
    db.query.assets.findMany({
      where: eq(assets.creatorSubmissionId, submissionId),
    }),
  ]);

  if (!submission) {
    redirect("/");
  }

  if (!batch) {
    redirect(`/submissions/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Button variant="outline" size="sm" asChild className="w-fit">
        <Link href={`/submissions/${id}`}>
          <ChevronLeft className="size-4" />
          Submissions
        </Link>
      </Button>

      <SubmissionReview submissionName={submission.name} submission={batch as any} assets={batchAssets} submissionLink={null} />
    </div>
  );
}
