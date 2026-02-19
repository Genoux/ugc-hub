"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { approveSubmission } from "@/features/batches/actions/review-submission";
import { AssetCard } from "@/shared/components/asset-card";
import { Badge } from "@/shared/components/ui/badge";
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
  isNew: boolean;
  deliveredAt: Date;
  assets: Asset[];
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

  return (
    <AssetCard
      src={url}
      filename={asset.filename}
      isVideo={asset.mimeType.startsWith("video/")}
      isLoading={isLoading}
    />
  );
}

function BatchSection({ batch, reviewed }: { batch: Batch; reviewed: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">{batch.label}</span>
          {!reviewed && batch.isNew && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
              New
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {batch.assets.length} file{batch.assets.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(batch.deliveredAt).toLocaleDateString()}
        </span>
      </div>

      <div className="p-5">
        {batch.assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files in this batch.</p>
        ) : (
          <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
            {batch.assets.map((asset) => (
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
  creator: { id: string; fullName: string; email: string };
  batches: Batch[];
}

export function CreatorFolderClient({
  submissionId,
  submissionName,
  creator,
  batches,
}: CreatorFolderClientProps) {
  const newBatches = batches.filter((b) => b.isNew);
  const [reviewed, setReviewed] = useState(newBatches.length === 0);
  const [isMarking, setIsMarking] = useState(false);

  async function handleMarkAllReviewed() {
    setIsMarking(true);
    try {
      await Promise.all(newBatches.map((b) => approveSubmission(b.id)));
      setReviewed(true);
    } catch {
      toast.error("Failed to mark as reviewed.");
    } finally {
      setIsMarking(false);
    }
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
              <p className="text-sm text-muted-foreground">{creator.email}</p>
            </div>
          </div>
        </div>

        {!reviewed && (
          <Button
            size="sm"
            onClick={handleMarkAllReviewed}
            disabled={isMarking}
            className="shrink-0 mt-8"
          >
            Mark all as reviewed
          </Button>
        )}
      </div>

      {/* Batches */}
      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <BatchSection key={batch.id} batch={batch} reviewed={reviewed} />
          ))}
        </div>
      )}
    </div>
  );
}
