"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/lib/routes";

interface StepSubmittingAsProps {
  creatorName: string;
  creatorEmail: string;
  creatorImageUrl: string;
  projectName: string;
}

export function StepSubmittingAs({
  creatorName,
  creatorEmail,
  creatorImageUrl,
  projectName,
}: StepSubmittingAsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Project: {projectName}</p>
      <div className="flex flex-wrap justify-between items-center gap-4 rounded-lg border bg-muted/40 px-4 py-3">
        <div className="flex gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image src={creatorImageUrl} alt={creatorName} fill unoptimized className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{creatorName}</p>
            <p className="text-sm text-muted-foreground truncate">{creatorEmail}</p>
          </div>
        </div>
        <Button onClick={() => redirect(ROUTES.signOut)} variant="outline" size="sm">
          Sign out
        </Button>
      </div>
    </div>
  );
}
