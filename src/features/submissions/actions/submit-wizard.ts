"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { collaborations, creators, projects, submissions } from "@/db/schema";
import { notifySlack } from "@/integrations/slack/notify-slack";
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
      columns: { id: true, clerkUserId: true, email: true, fullName: true },
    });

    if (!creator) throw new Error("Creator not found");

    const isLinked = creator.clerkUserId === userId;
    if (!isLinked) {
      const clerkUser = await (await clerkClient()).users.getUser(userId);
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
      const emailMatch = primaryEmail && creator.email?.toLowerCase().trim() === primaryEmail;
      if (!emailMatch) throw new Error("Forbidden");
    }

    const shouldBindClerk = !isLinked && !creator.clerkUserId;

    const { collab, submission } = await db.transaction(async (tx) => {
      if (shouldBindClerk) {
        await tx.update(creators).set({ clerkUserId: userId }).where(eq(creators.id, creator.id));
      }

      let collab = await tx.query.collaborations.findFirst({
        where: and(
          eq(collaborations.projectId, project.id),
          eq(collaborations.creatorId, creator.id),
        ),
        with: { submissions: { columns: { submissionNumber: true } } },
      });

      if (!collab) {
        const [inserted] = await tx
          .insert(collaborations)
          .values({ projectId: project.id, creatorId: creator.id, status: "active" })
          .returning();
        collab = { ...inserted, submissions: [] };
      }

      const nextSubmissionNumber = collab.submissions.length + 1;

      const [submission] = await tx
        .insert(submissions)
        .values({
          collaborationId: collab.id,
          label: `Submission ${nextSubmissionNumber}`,
          submissionNumber: nextSubmissionNumber,
        })
        .returning();

      if (!submission) throw new Error("Failed to create submission");

      return { collab, submission };
    });

    notifySlack({
      type: "creator_uploaded_content",
      creatorName: creator.fullName ?? creator.email ?? data.creatorId,
      projectName: project.name,
      submissionLabel: submission.label,
    });

    return { project, folder: collab, submission };
  } catch (err) {
    throw toActionError(err);
  }
}
