"use client";

import { ChevronRight, Files, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetCard } from "@/shared/components/asset-card";

function AssetPreview({
  assetId,
  filename,
  mimeType,
}: {
  assetId: string;
  filename: string;
  mimeType: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assets/${assetId}/download`)
      .then((r) => r.json())
      .then(({ url: signed }) => setUrl(signed))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [assetId]);

  return (
    <AssetCard
      src={url}
      filename={filename}
      isVideo={mimeType.startsWith("video/")}
      isLoading={isLoading}
    />
  );
}

type Batch = CreatorSubmissions[number]["batches"][number];

function BatchRow({ batch }: { batch: Batch }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Files className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground">{batch.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {batch.assets.length} file{batch.assets.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(batch.deliveredAt).toLocaleDateString()}
          </span>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {batch.assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files in this batch.</p>
          ) : (
            <div className="columns-2 gap-2 sm:columns-3">
              {batch.assets.map((asset) => (
                <AssetPreview
                  key={asset.id}
                  assetId={asset.id}
                  filename={asset.filename}
                  mimeType={asset.mimeType}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CreatorContentTabProps {
  content: CreatorSubmissions;
}

export function CreatorContentTab({ content }: CreatorContentTabProps) {
  const hasAny = content.some((p) => p.batches.length > 0);

  if (!hasAny) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Projects you've submitted content for will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.map((project) => {
        if (project.batches.length === 0) return null;
        const totalFiles = project.batches.reduce((s, b) => s + b.assets.length, 0);

        return (
          <div key={project.submissionId}>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {project.submissionName}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {project.batches.length} batch{project.batches.length !== 1 ? "es" : ""} ·{" "}
                {totalFiles} file{totalFiles !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2 pl-6">
              {project.batches.map((batch) => (
                <BatchRow key={batch.id} batch={batch} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
