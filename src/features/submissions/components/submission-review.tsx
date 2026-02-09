"use client";

import { Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { approveSubmission, rejectSubmission } from "../actions/review-submission";
import { SubmissionStatusBadge } from "./submission-status-badge";

type Submission = {
  id: string;
  creatorName: string | null;
  creatorEmail: string | null;
  creatorNotes: string | null;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
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

  const isImage = asset.mimeType.startsWith("image/");
  const isVideo = asset.mimeType.startsWith("video/");

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        {isLoading ? (
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
        ) : (
          downloadUrl && (
            <div className="overflow-hidden rounded-lg">
              {isImage && (
                <Image
                  src={downloadUrl}
                  alt={asset.filename}
                  width={800}
                  height={800}
                  className="h-auto w-full object-contain"
                  unoptimized
                />
              )}
              {isVideo && (
                <video src={downloadUrl} controls className="h-auto w-full">
                  <track kind="captions" src="" srcLang="en" label="English" />
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          )
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{asset.filename}</p>
            <p className="text-xs text-muted-foreground">
              {(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <Button onClick={handleDownload} variant="ghost" size="sm">
            <Download className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type SubmissionLink = {
  token: string;
  status: string;
};

export function SubmissionReview({
  campaignName,
  submission,
  assets,
  submissionLink,
}: {
  campaignName: string;
  submission: Submission;
  assets: Asset[];
  submissionLink?: SubmissionLink | null;
}) {
  const [isReviewing, setIsReviewing] = useState(false);

  async function handleApprove() {
    setIsReviewing(true);
    try {
      await approveSubmission(submission.id);
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleReject() {
    setIsReviewing(true);
    try {
      await rejectSubmission(submission.id);
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{campaignName}</h1>
          <SubmissionStatusBadge status={submission.status as "awaiting" | "pending" | "approved" | "rejected"} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{submission.creatorName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{submission.creatorEmail}</span>
          </div>
          {submission.creatorNotes && (
            <div>
              <span className="text-muted-foreground">Notes:</span>{" "}
              <span>{submission.creatorNotes}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Submitted:</span>{" "}
            {new Date(submission.createdAt).toLocaleString()}
          </div>
          {submission.reviewedAt && (
            <div>
              <span className="text-muted-foreground">Reviewed:</span>{" "}
              {new Date(submission.reviewedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {submissionLink && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Submission reference ID</h2>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-muted-foreground">{submissionLink.token}</p>
          </div>
        </div>
      )}

      {submission.status === "pending" && (
        <div className="flex gap-1 items-start">
          <Button onClick={handleReject} disabled={isReviewing} variant="outline">
            Reject
          </Button>
          <Button onClick={handleApprove} disabled={isReviewing}>
            Approve
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Assets ({assets.length})</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets uploaded</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <AssetPreview key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
