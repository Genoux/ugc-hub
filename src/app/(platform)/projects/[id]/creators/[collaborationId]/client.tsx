"use client";

import { CheckCircle2, ChevronLeft, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CloseCollaborationWizard } from "@/features/collaborations/components/close-collaboration-wizard";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import { AssetCard } from "@/shared/components/asset-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
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

function SubmissionSection({
  submission,
  projectName,
  creatorFullName,
}: {
  submission: Submission;
  projectName: string;
  creatorFullName: string;
}) {
  const submissionAssets = submission.assets.map((a) => ({ id: a.id, filename: a.filename }));

  async function handleDownloadSubmission() {
    if (submissionAssets.length === 0) {
      toast.info("No assets to download");
      return;
    }
    await downloadAssets(submissionAssets, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: `${projectName} - Submission ${submission.submissionNumber} - ${creatorFullName}`,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 flex-wrap">
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
        </div>
      </div>

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
                isVideo={asset.mimeType.startsWith("video/")}
                action={
                  <Button
                    className="h-8 w-8 text-white! hover:bg-white/20"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      downloadAssets([{ id: asset.id, filename: asset.filename }], {
                        onError: () => toast.error("Download failed"),
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CreatorCollaborationClient({
  collaboration,
}: {
  collaboration: CollaborationDetail;
}) {
  const { id, status, project, creator, submissions, highlights } = collaboration;
  const [isClosed, setIsClosed] = useState(status === "closed");
  const [showCloseWizard, setShowCloseWizard] = useState(false);

  async function handleDownloadAll() {
    const allAssets = submissions.flatMap((s) =>
      s.assets.map((a) => ({ id: a.id, filename: a.filename })),
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/projects/${project.id}`}>
              <ChevronLeft className="size-4" />
              {project.name}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {creator.profilePhotoUrl && (
                <AvatarImage src={creator.profilePhotoUrl} alt={creator.fullName} />
              )}
              <AvatarFallback className="text-base">{creator.fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{creator.fullName}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{creator.email}</p>
                {isClosed && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Collaboration closed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-8 shrink-0">
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

      {highlights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Project Highlights</h2>
          <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
            {highlights.map((asset) => (
              <AssetCard
                key={asset.id}
                src={asset.url}
                filename={asset.filename}
                isVideo={asset.mimeType.startsWith("video/")}
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
