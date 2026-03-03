import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { creators, projects } from "@/db/schema";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import type { SubmitPageView } from "./client";
import { SubmitPageClient } from "./client";

export const metadata: Metadata = {
  title: "inBeat - Asset Submissions",
};

export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.uploadToken, token),
  });

  if (!project) notFound();

  if (project.status === "closed") {
    return <SubmitPageClient view={{ view: "closed" }} />;
  }

  if (project.status !== "active") {
    return <SubmitPageClient view={{ view: "unavailable", status: project.status }} />;
  }

  const { userId } = await auth.protect();
  const { creator } = await getSessionCreator(userId);

  if (!creator) {
    redirect(ROUTES.signOut);
  }

  if (creator.status === "applicant") {
    return <SubmitPageClient view={{ view: "pending_applicant" }} />;
  }

  if (!creator.clerkUserId) {
    await db.update(creators).set({ clerkUserId: userId }).where(eq(creators.id, creator.id));
  }

  const profilePhotoUrl = toMediaUrl(creator.profilePhoto);

  const view: SubmitPageView = {
    view: "wizard",
    token,
    projectName: project.name,
    creatorId: creator.id,
    creatorName: creator.fullName,
    creatorEmail: creator.email,
    creatorImageUrl: profilePhotoUrl ?? "",
  };

  return <SubmitPageClient view={view} />;
}
