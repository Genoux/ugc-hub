"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PortfolioFile } from "../components/steps/step-portfolio";

type PersistArgs = {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export function usePortfolioUpload(options: {
  creatorId: string;
  sessionId: string;
  onFilePersisted?: (args: PersistArgs) => Promise<void>;
}) {
  const { creatorId, sessionId, onFilePersisted } = options;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(
    async (files: PortfolioFile[], totalFiles: number) => {
      const pending = files.filter((f) => !f.uploaded);
      if (pending.length === 0) return files;

      const progressPerFile = totalFiles > 0 ? 80 / totalFiles : 80;
      const updated: PortfolioFile[] = [...files];

      for (const pf of pending) {
        try {
          const res = await fetch("/api/uploads/portfolio/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creatorCollaborationId: sessionId,
              creatorId,
              filename: pf.file.name,
              mimeType: pf.file.type,
              fileSize: pf.file.size,
            }),
          });

          if (!res.ok) throw new Error("Failed to get presigned URL");
          const { uploadUrl, key } = await res.json();

          const putRes = await fetch(uploadUrl, {
            method: "PUT",
            body: pf.file,
            headers: { "Content-Type": pf.file.type },
          });
          if (!putRes.ok) throw new Error("Upload failed");

          if (onFilePersisted) {
            await onFilePersisted({
              key,
              filename: pf.file.name,
              mimeType: pf.file.type,
              sizeBytes: pf.file.size,
            });
          }

          const idx = updated.indexOf(pf);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], key, uploaded: true };
          }
        } catch {
          toast.error(`Failed to upload ${pf.file.name}`);
        }

        setUploadProgress((prev) => Math.min(prev + progressPerFile, 80));
      }

      return updated;
    },
    [creatorId, sessionId, onFilePersisted],
  );

  return {
    uploadProgress,
    setUploadProgress,
    isUploading,
    setIsUploading,
    uploadFiles,
  };
}
