"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssetCard } from "@/shared/components/asset-card";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { approveSubmission, rejectSubmission } from "../actions/review-submission";

type Batch = {
  id: string;
  label: string;
  isNew: boolean;
  deliveredAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  creatorFolder: {
    creator: {
      fullName: string;
      email: string;
    };
  };
};

type Asset = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadStatus: string;
};

function AssetPreview({ asset }: { asset: Asset }) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assets/${asset.id}/download`)
      .then((res) => res.json())
      .then(({ url }) => setDownloadUrl(url))
      .catch((err) => console.error("Failed to load preview:", err))
      .finally(() => setIsLoading(false));
  }, [asset.id]);

  async function handleDownload() {
    try {
      const url =
        downloadUrl ||
        (await fetch(`/api/assets/${asset.id}/download`)
          .then((r) => r.json())
          .then((d) => d.url));

      const link = document.createElement("a");
      link.href = url;
      link.download = asset.filename;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  return (
    <AssetCard
      src={downloadUrl}
      filename={asset.filename}
      isVideo={asset.mimeType.startsWith("video/")}
      isLoading={isLoading}
      action={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDownload}
                variant="link"
                size="icon-sm"
                className="hover:bg-white/20"
              >
                <Download className="size-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download asset</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    />
  );
}

export function SubmissionReview({
  submissionName,
  submission,
  assets,
}: {
  submissionName: string;
  submission: Batch;
  assets: Asset[];
  submissionLink?: unknown; // Legacy prop, no longer used
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isReviewing, setIsReviewing] = useState(false);

  async function handleMarkReviewed() {
    setIsReviewing(true);
    try {
      await approveSubmission(submission.id);
      await queryClient.invalidateQueries({ queryKey: ["submission"] });
      router.refresh();
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{submissionName}</h1>
          <p className="text-sm text-muted-foreground">{submission.label}</p>
        </div>
        {submission.isNew && (
          <Button onClick={handleMarkReviewed} disabled={isReviewing}>
            Mark as Reviewed
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Creator:</span>{" "}
            <span className="font-medium">{submission.creatorFolder.creator.fullName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{submission.creatorFolder.creator.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Delivered:</span>{" "}
            {new Date(submission.deliveredAt).toLocaleString()}
          </div>
          {submission.reviewedAt && (
            <div>
              <span className="text-muted-foreground">Reviewed:</span>{" "}
              {new Date(submission.reviewedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Assets ({assets.length})</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets uploaded</p>
        ) : (
          <div className="columns-2 gap-2">
            {assets.map((asset) => (
              <AssetPreview key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
