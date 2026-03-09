"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { CollaborationDetail } from "@/entities/collaboration/types";
import { CloseCollaborationWizard } from "@/features/collaborations/components/close-collaboration-wizard";
import { CreatorProfileSheet } from "@/features/creators/components/admin/creator-profile-sheet";
import { SubmissionSection } from "@/features/projects/components/submission-section";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { DownloadButton } from "@/shared/components/blocks/download-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

interface CreatorCollaborationProps {
  collaboration: CollaborationDetail;
}

export function CreatorCollaboration({ collaboration }: CreatorCollaborationProps) {
  const queryClient = useQueryClient();
  const { id, status, project, creator, submissions } = collaboration;
  const [isClosed, setIsClosed] = useState(status === "closed");
  const [showCloseWizard, setShowCloseWizard] = useState(false);

  function handleCloseSuccess() {
    setIsClosed(true);
    queryClient.invalidateQueries({
      queryKey: platformQueryKeys.collaborationDetail(project.id, id),
    });
    queryClient.invalidateQueries({ queryKey: platformQueryKeys.database });
  }

  const allAssets = submissions.flatMap((s) =>
    s.assets.map((a) => ({ id: a.id, filename: a.filename, url: a.url })),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{creator.fullName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 shrink-0">
            <DownloadButton
              assets={allAssets}
              zipName={`${project.name} - ${creator.fullName}`}
              onEmpty={() => toast.info("No assets to download")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Download all
            </DownloadButton>
            {!isClosed && (
              <Button size="sm" onClick={() => setShowCloseWizard(true)}>
                Close Collaboration
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-end gap-3 justify-between w-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              {creator.profilePhotoUrl && (
                <AvatarImage src={creator.profilePhotoUrl} alt={creator.fullName} />
              )}
              <AvatarFallback className="text-base">{creator.fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CreatorProfileSheet creatorId={creator.id} creatorName={creator.fullName}>
                <h1 className="hover:underline text-2xl font-semibold">{creator.fullName}</h1>
              </CreatorProfileSheet>

              <p className="text-sm text-muted-foreground">{creator.email}</p>
            </div>
          </div>

          {isClosed && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Collaboration closed
            </div>
          )}
        </div>
      </div>
      <hr />
      {collaboration.highlights.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Collaboration highlights</h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {collaboration.highlights.map((highlight) => (
              <AssetCard
                key={highlight.id}
                size="md"
                src={highlight.url}
                filename={highlight.filename}
              />
            ))}
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {submissions.map((submission) => (
            <SubmissionSection
              key={submission.id}
              submission={submission}
              projectName={project.name}
              creatorFullName={creator.fullName}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCloseWizard && (
          <CloseCollaborationWizard
            onClose={() => setShowCloseWizard(false)}
            onSuccess={handleCloseSuccess}
            collaborationId={id}
            creatorId={creator.id}
            creatorName={creator.fullName}
            profilePhotoUrl={creator.profilePhotoUrl ?? ""}
            submissionName={project.name}
            closedCollabRatings={creator.closedCollabRatings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
