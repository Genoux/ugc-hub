"use client";

import { useRef } from "react";
import { useFileUpload } from "@/features/uploads/hooks/use-file-upload";

type SubmissionContext = {
  projectId: string;
  folderId: string;
  submissionId: string;
};

export function useSubmissionUpload(onProgress: (percent: number) => void) {
  const contextRef = useRef<SubmissionContext | null>(null);

  const { upload, isUploading } = useFileUpload({
    presign: async (file) => {
      const ctx = contextRef.current;
      if (!ctx) throw new Error("Upload called before submission context was set");
      const res = await fetch("/api/uploads/submission/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          projectId: ctx.projectId,
          creatorCollaborationId: ctx.folderId,
          submissionId: ctx.submissionId,
        }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      return res.json();
    },
    onComplete: async (file, result) => {
      const ctx = contextRef.current;
      if (!ctx) throw new Error("Upload called before submission context was set");
      await fetch("/api/uploads/submission/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: result.key,
          submissionId: ctx.submissionId,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          ...(result.uploadId ? { uploadId: result.uploadId, parts: result.parts } : {}),
        }),
      });
    },
    onProgress,
  });

  function setContext(ctx: SubmissionContext) {
    contextRef.current = ctx;
  }

  return { upload, isUploading, setContext };
}
