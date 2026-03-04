"use client";

import { CheckCircle2, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CloseCollaborationWizard } from "@/features/collaborations/components/close-collaboration-wizard";
import type { CollaborationDetail } from "@/features/projects/actions/get-collaboration-detail";
import { SubmissionSection } from "@/features/projects/components/submission-section";
import { downloadAssets } from "@/features/projects/lib/download-assets";
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

interface CreatorCollaborationProps {
  collaboration: CollaborationDetail;
}

export function CreatorCollaboration({ collaboration }: CreatorCollaborationProps) {
  const { id, status, project, creator, submissions } = collaboration;
  const [isClosed, setIsClosed] = useState(status === "closed");
  const [showCloseWizard, setShowCloseWizard] = useState(false);

  async function handleDownloadAll() {
    const allAssets = submissions.flatMap((s) =>
      s.assets.map((a) => ({ id: a.id, filename: a.filename, url: a.url })),
    );
    if (allAssets.length === 0) {
      toast.info("No assets to download");
      return;
    }
    await downloadAssets(allAssets, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: `${project.name} - ${creator.fullName}`,
    });
  }

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
            <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-2">
              Download all
              <Download className="h-4 w-4" />
            </Button>
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
              <h1 className="text-2xl font-semibold tracking-tight">{creator.fullName}</h1>
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

      <CloseCollaborationWizard
        open={showCloseWizard}
        onClose={() => setShowCloseWizard(false)}
        onSuccess={() => setIsClosed(true)}
        collaborationId={id}
        creatorId={creator.id}
        creatorName={creator.fullName}
        submissionName={project.name}
      />
    </div>
  );
}
