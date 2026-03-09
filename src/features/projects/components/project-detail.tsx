"use client";

import { Check, ChevronLeft, ChevronRight, Copy, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ProjectDetail as ProjectDetailType } from "@/entities/project/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface ProjectDetailProps {
  project: ProjectDetailType;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [copiedToken, setCopiedToken] = useState(false);

  async function handleCopyToken() {
    const url = `${window.location.origin}/submit/${project.uploadToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/projects">
            <ChevronLeft className="size-4" />
            Projects
          </Link>
        </Button>
        <div className="flex gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCopyToken} variant="outline" size="sm">
                {copiedToken ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiedToken ? "Copied!" : "Copy Upload Link"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this link with creators to upload content</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <p className="text-sm text-muted-foreground shrink-0">
          {project.collaborations.length} creator{project.collaborations.length !== 1 ? "s" : ""}
        </p>

        {project.collaborations.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Folder className="h-8 w-8 text-muted-foreground/50" />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyTitle>No uploads yet</EmptyTitle>
              <EmptyDescription>Share the upload link to start receiving content</EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="space-y-2">
            {project.collaborations.map((collaboration) => {
              const totalFiles = collaboration.submissions.reduce((s, b) => s + b.assets.length, 0);

              return (
                <Link
                  key={collaboration.id}
                  href={`/projects/${project.id}/creators/${collaboration.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 hover:bg-accent/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {collaboration.creator.profilePhotoUrl && (
                        <AvatarImage
                          src={collaboration.creator.profilePhotoUrl}
                          alt={collaboration.creator.fullName}
                        />
                      )}
                      <AvatarFallback>{collaboration.creator.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none">
                        {collaboration.creator.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {collaboration.creator.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {collaboration.submissions.length} submission
                      {collaboration.submissions.length !== 1 ? "s" : ""} · {totalFiles} file
                      {totalFiles !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
