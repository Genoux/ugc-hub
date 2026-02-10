import { eq } from "drizzle-orm";
import { links, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return Response.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });

    if (!submission) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    await db
      .update(submissions)
      .set({
        creatorName: null,
        creatorEmail: null,
        status: "awaiting",
      })
      .where(eq(submissions.id, submissionId));

    await db.update(links).set({ status: "active" }).where(eq(links.id, submission.linkId));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Rollback error:", error);
    return Response.json({ error: "Rollback failed" }, { status: 500 });
  }
}
