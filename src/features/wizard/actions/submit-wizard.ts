"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { collaborations, creators, projects, submissions } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { db } from "@/shared/lib/db";

export async function submitWizard(data: { token: string; creatorId: string }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const project = await db.query.projects.findFirst({
      where: eq(projects.uploadToken, data.token),
    });

    if (!project) throw new Error("Project not found");
    if (project.status !== "active") throw new Error("Project is not active");

    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, data.creatorId),
      columns: { id: true, clerkUserId: true, email: true },
    });

    if (!creator) throw new Error("Creator not found");

    const isLinked = creator.clerkUserId === userId;
    if (!isLinked) {
      const clerkUser = await (await clerkClient()).users.getUser(userId);
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
      const emailMatch = primaryEmail && creator.email?.toLowerCase().trim() === primaryEmail;
      if (!emailMatch) throw new Error("Forbidden");
      if (!creator.clerkUserId) {
        await db.update(creators).set({ clerkUserId: userId }).where(eq(creators.id, creator.id));
      }
    }

    // Reuse existing collaboration for this creator+project; create one on first submission
    let collab = await db.query.collaborations.findFirst({
      where: and(
        eq(collaborations.projectId, project.id),
        eq(collaborations.creatorId, creator.id),
      ),
      with: { submissions: { columns: { submissionNumber: true } } },
    });

    if (!collab) {
      const [inserted] = await db
        .insert(collaborations)
        .values({ projectId: project.id, creatorId: creator.id, status: "active" })
        .returning();
      collab = { ...inserted, submissions: [] };
    }

    const nextSubmissionNumber = collab.submissions.length + 1;

    const [submission] = await db
      .insert(submissions)
      .values({
        collaborationId: collab.id,
        label: `Submission ${nextSubmissionNumber}`,
        submissionNumber: nextSubmissionNumber,
      })
      .returning();

    return { project, folder: collab, submission };
  } catch (err) {
    throw toActionError(err);
  }
}
