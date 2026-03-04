"use client";

import { CheckCircle2, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CloseCollaborationWizard } from "@/features/collaborations/components/close-collaboration-wizard";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  CollapsibleSection,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
} from "@/shared/components/blocks/collapsible-section";
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

type Asset = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

type Submission = {
  id: string;
  label: string;
  submissionNumber: number;
  deliveredAt: Date;
  assets: Asset[];
};

type Highlight = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
};

export type CollaborationDetail = {
  id: string;
  status: "active" | "closed";
  project: { id: string; name: string };
  creator: { id: string; fullName: string; email: string; profilePhotoUrl: string | null };
  submissions: Submission[];
  highlights: Highlight[];
};

function SubmissionSectionContent({
  submission,
  projectName,
  creatorFullName,
}: {
  submission: Submission;
  projectName: string;
  creatorFullName: string;
}) {
  const { open } = useCollapsible();
  const submissionAssets = submission.assets.map((a) => ({
    id: a.id,
    filename: a.filename,
    url: a.url,
  }));

  async function handleDownloadSubmission(e: React.MouseEvent) {
    e.stopPropagation();
    await downloadAssets(submissionAssets, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: `${projectName} - Submission ${submission.submissionNumber} - ${creatorFullName}`,
    });
  }

  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between rounded-none px-5 py-4 hover:bg-accent/40 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">{submission.label}</span>
            <span className="text-xs text-muted-foreground">
              {submission.assets.length} file{submission.assets.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {submissionAssets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadSubmission}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download all
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(submission.deliveredAt).toLocaleDateString()}
            </span>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
            />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-5">
          {submission.assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files in this submission.</p>
          ) : (
            <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
              {submission.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  src={asset.url}
                  filename={asset.filename}
                  action={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadAssets([{ id: asset.id, filename: asset.filename, url: asset.url }], {
                      onError: () => toast.error("Download failed"),
                    });
                  }}
                  buttonIcon={<Download className="h-4 w-4" />}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </>
  );
}

function SubmissionSection({
  submission,
  projectName,
  creatorFullName,
}: {
  submission: Submission;
  projectName: string;
  creatorFullName: string;
}) {
  return (
    <CollapsibleSection>
      <SubmissionSectionContent
        submission={submission}
        projectName={projectName}
        creatorFullName={creatorFullName}
      />
    </CollapsibleSection>
  );
}

export function CreatorCollaborationClient({
  collaboration,
}: {
  collaboration: CollaborationDetail;
}) {
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
      {/* Header — sticky so it stays visible while scrolling */}
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
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{creator.email}</p>
              </div>
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

      {/* {highlights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Project Highlights</h2>
          <div className="grid grid-cols-6 gap-2">
            {highlights.map((asset) => (
              <AssetCard
                key={asset.id}
                src={asset.url}
                filename={asset.filename}
              />
            ))}
          </div>
        </div>
      )} */}

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
