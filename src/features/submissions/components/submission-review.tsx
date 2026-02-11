"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { AssetCard } from "@/shared/components/asset-card";
import { approveSubmission, rejectSubmission } from "../actions/review-submission";
import { SubmissionStatusBadge } from "./submission-status-badge";

type Submission = {
  id: string;
  creatorName: string | null;
  creatorEmail: string | null;
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

  return (
    <AssetCard
      src={downloadUrl}
      filename={asset.filename}
      isVideo={asset.mimeType.startsWith("video/")}
      isLoading={isLoading}
      action={
        <Button onClick={handleDownload} variant="link" size="icon-sm" className="hover:opacity-50">
          <Download className="size-4 text-white" />
        </Button>
      }
    />
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
          <SubmissionStatusBadge
            status={submission.status as "awaiting" | "pending" | "approved" | "rejected"}
          />
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
