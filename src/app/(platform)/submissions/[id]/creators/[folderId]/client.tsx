"use client";

import { CheckCircle2, ChevronLeft, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CloseCollaborationWizard } from "@/features/collaborations/components/close-collaboration-wizard";
import { downloadAssets } from "@/features/submissions/lib/download-assets";
import { AssetCard } from "@/shared/components/asset-card";
import { Button } from "@/shared/components/ui/button";

type Asset = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

type Batch = {
  id: string;
  label: string;
  batchNumber: number;
  deliveredAt: Date;
  submissionAssets: Asset[];
};

type PortfolioAsset = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

function AssetPreview({ asset }: { asset: Asset }) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assets/${asset.id}/download`)
      .then((r) => r.json())
      .then(({ url: signed }) => setUrl(signed))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [asset.id]);

  function handleDownload() {
    downloadAssets([{ id: asset.id, filename: asset.filename }], {
      onError: () => toast.error("Download failed"),
    });
  }

  return (
    <div className="relative w-full group/card">
      <AssetCard
        src={url}
        filename={asset.filename}
        isVideo={asset.mimeType.startsWith("video/")}
        isLoading={isLoading}
        action={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        }
      />
    </div>
  );
}

function BatchSection({
  batch,
  submissionName,
  creatorFullName,
}: {
  batch: Batch;
  submissionName: string;
  creatorFullName: string;
}) {
  const batchAssets = batch.submissionAssets.map((a) => ({ id: a.id, filename: a.filename }));

  async function handleDownloadBatch() {
    if (batchAssets.length === 0) {
      toast.info("No assets to download");
      return;
    }
    await downloadAssets(batchAssets, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: `${submissionName} - Submission ${batch.batchNumber} - ${creatorFullName}`,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-foreground">{batch.label}</span>
          <span className="text-xs text-muted-foreground">
            {batch.submissionAssets.length} file{batch.submissionAssets.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {batchAssets.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleDownloadBatch} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download all
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(batch.deliveredAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="p-5">
        {batch.submissionAssets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files in this batch.</p>
        ) : (
          <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
            {batch.submissionAssets.map((asset) => (
              <AssetPreview key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CreatorFolderClientProps {
  submissionId: string;
  submissionName: string;
  collaborationId: string;
  creator: { id: string; fullName: string; email: string };
  collaborationStatus: "active" | "closed";
  batches: Batch[];
  portfolioAssets: PortfolioAsset[];
}

export function CreatorFolderClient({
  submissionId,
  submissionName,
  collaborationId,
  creator,
  collaborationStatus,
  batches,
  portfolioAssets,
}: CreatorFolderClientProps) {
  const [isClosed, setIsClosed] = useState(collaborationStatus === "closed");
  const [showCloseWizard, setShowCloseWizard] = useState(false);

  async function handleDownloadAll() {
    const allAssets = batches.flatMap((b) =>
      b.submissionAssets.map((a) => ({ id: a.id, filename: a.filename })),
    );
    if (allAssets.length === 0) {
      toast.info("No assets to download");
      return;
    }
    await downloadAssets(allAssets, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: `${submissionName} - ${creator.fullName}`,
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/submissions/${submissionId}`}>
              <ChevronLeft className="size-4" />
              {submissionName}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-foreground">
              {creator.fullName[0]}
            </div>
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

      {/* Project portfolio (shown after close when assets were uploaded) */}
      {portfolioAssets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Project Portfolio</h2>
          <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
            {portfolioAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                src={null}
                filename={asset.filename}
                isVideo={asset.mimeType.startsWith("video/")}
                isLoading={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Batches */}
      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <BatchSection
              key={batch.id}
              batch={batch}
              submissionName={submissionName}
              creatorFullName={creator.fullName}
            />
          ))}
        </div>
      )}

      <CloseCollaborationWizard
        open={showCloseWizard}
        onClose={() => setShowCloseWizard(false)}
        onSuccess={() => setIsClosed(true)}
        collaborationId={collaborationId}
        creatorId={creator.id}
        creatorName={creator.fullName}
        submissionName={submissionName}
      />
    </div>
  );
}
