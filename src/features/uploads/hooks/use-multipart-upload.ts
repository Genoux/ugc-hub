"use client";

import { useState } from "react";
import { putToR2 } from "../lib/r2-upload";
import { UPLOAD_CONFIG } from "../lib/upload-config";

type UploadStatus = {
  filename: string;
  status: "pending" | "uploading" | "completed" | "failed";
};

export type UploadFileOptions = {
  onProgress?: (percent: number) => void;
};

export function useMultipartUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadStatus>>({});

  async function uploadFile(
    file: File,
    projectId: string,
    creatorCollaborationId: string,
    submissionId: string,
    options?: UploadFileOptions,
  ) {
    const fileId = `${file.name}-${Date.now()}`;

    setUploads((prev) => ({
      ...prev,
      [fileId]: { filename: file.name, status: "pending" },
    }));

    try {
      const presignResponse = await fetch("/api/uploads/submission/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          projectId,
          creatorCollaborationId,
          submissionId,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key, isMultipart, uploadId, partUrls } = await presignResponse.json();

      setUploads((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "uploading" },
      }));

      if (isMultipart) {
        await uploadMultipart(file, key, uploadId, partUrls, submissionId, options?.onProgress);
      } else {
        await uploadSingle(file, uploadUrl, key, submissionId, options?.onProgress);
      }

      setUploads((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "completed" },
      }));
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Upload failed:", error);
      setUploads((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "failed" },
      }));
      throw error;
    }
  }

  async function uploadSingle(
    file: File,
    uploadUrl: string,
    key: string,
    submissionId: string,
    onProgress?: (percent: number) => void,
  ) {
    await putToR2(
      file,
      uploadUrl,
      onProgress ? (loaded, total) => onProgress(total ? (loaded / total) * 100 : 0) : undefined,
    );

    await fetch("/api/uploads/submission/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        submissionId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    });
  }

  async function uploadMultipart(
    file: File,
    key: string,
    uploadId: string,
    partUrls: string[],
    submissionId: string,
    onProgress?: (percent: number) => void,
  ) {
    const chunkSize = UPLOAD_CONFIG.chunkSize;
    const totalSize = file.size;
    const partLoaded = new Array<number>(partUrls.length).fill(0);

    function reportProgress() {
      if (!onProgress) return;
      const totalLoaded = partLoaded.reduce((a, b) => a + b, 0);
      onProgress(totalSize ? (totalLoaded / totalSize) * 100 : 0);
    }

    const parts = await Promise.all(
      partUrls.map(async (partUrl, i) => {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const etag = await putToR2(chunk, partUrl, (loaded) => {
          partLoaded[i] = loaded;
          reportProgress();
        });
        return { PartNumber: i + 1, ETag: etag ?? "" };
      }),
    );

    await fetch("/api/uploads/submission/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
        submissionId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    });
  }

  return { uploads, uploadFile };
}
