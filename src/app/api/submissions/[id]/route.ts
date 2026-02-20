import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { creatorFolders, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return Response.json({ error: "Invalid submission ID" }, { status: 400 });
  }

  // Middleware already checked domain - fetch submission
  const [submission, folders] = await Promise.all([
    db.query.submissions.findFirst({
      where: eq(submissions.id, id),
    }),
    db.query.creatorFolders.findMany({
      where: eq(creatorFolders.submissionId, id),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
      with: {
        creator: true,
        creatorSubmissions: {
          with: {
            submissionAssets: true,
          },
        },
      },
    }),
  ]);

  if (!submission) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  return Response.json(
    { submission: submission, folders: folders },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
