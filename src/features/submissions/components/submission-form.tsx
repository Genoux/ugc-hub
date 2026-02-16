"use client";

import type React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateSubmissionMutation } from "../hooks/use-submissions-mutations";

export function SubmissionForm({ onSuccess }: { onSuccess?: () => void }) {
  const createSubmissionMutation = useCreateSubmissionMutation();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createSubmissionMutation.mutateAsync({
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
    } catch (error) {
      console.error("Failed to create submission:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Submission Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" name="name" placeholder="Enter submission name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Brief description (optional)" />
      </div>

      <Button type="submit" disabled={createSubmissionMutation.isPending} className="w-full">
        {createSubmissionMutation.isPending ? "Creating..." : "Create Submission"}
      </Button>
    </form>
  );
}
