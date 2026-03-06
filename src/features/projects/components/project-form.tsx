"use client";

import type React from "react";
import { useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { createProject } from "../actions/create-project";

export function ProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await createProject({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        assetRequirements: {
          acceptedTypes: ["image/jpeg", "image/png", "video/mp4"],
          maxFiles: 10,
          maxFileSize: 100 * 1024 * 1024,
        },
      });

      form.reset();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Project Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" name="name" placeholder="Enter project name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Brief description (optional)" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
