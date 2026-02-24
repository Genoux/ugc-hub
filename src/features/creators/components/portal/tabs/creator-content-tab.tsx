"use client";

import { ArrowLeft, ChevronRight, Files } from "lucide-react";
import { useState } from "react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetCard } from "@/shared/components/asset-card";
import { StatusBadge } from "@/shared/components/status-badge";
import { Button } from "@/shared/components/ui/button";

type Project = CreatorSubmissions[number];
type Batch = Project["batches"][number];

function BatchRow({ batch }: { batch: Batch }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Files className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium text-foreground">{batch.label}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {batch.assets.length} file{batch.assets.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(batch.deliveredAt).toLocaleDateString()}
          </p>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </Button>

      <div className={`border-t border-border p-4 ${open ? "" : "hidden"}`}>
        {batch.assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files in this batch.</p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {batch.assets.map((asset) => (
              <AssetCard
                key={asset.id}
                src={asset.url || null}
                filename={asset.filename}
                isVideo={asset.mimeType.startsWith("video/")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const totalFiles = project.batches.reduce((s, b) => s + b.assets.length, 0);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Button>
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{project.projectName}</p>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-muted-foreground ml-auto">
          {project.batches.length} batch{project.batches.length !== 1 ? "es" : ""} · {totalFiles}{" "}
          file{totalFiles !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {project.batches.map((batch) => (
          <BatchRow key={batch.id} batch={batch} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const totalFiles = project.batches.reduce((s, b) => s + b.assets.length, 0);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-border p-6 hover:bg-accent/40 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">{project.projectName}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={project.status} />
        <p className="text-xs text-muted-foreground">
          {project.batches.length} batch{project.batches.length !== 1 ? "es" : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {totalFiles} file{totalFiles !== 1 ? "s" : ""}
        </p>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Button>
  );
}

interface CreatorContentTabProps {
  content: CreatorSubmissions;
}

export function CreatorContentTab({ content }: CreatorContentTabProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects = content.filter((p) => p.batches.length > 0);

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Projects you've submitted content for will appear here.
      </div>
    );
  }

  if (selectedProjectId) {
    const project = projects.find((p) => p.projectId === selectedProjectId);
    if (project) {
      return <ProjectDetail project={project} onBack={() => setSelectedProjectId(null)} />;
    }
  }

  return (
    <div className="space-y-2 pt-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.projectId}
          project={project}
          onClick={() => setSelectedProjectId(project.projectId)}
        />
      ))}
    </div>
  );
}
