"use client";

import { useState } from "react";
import { UPLOAD_CONFIG } from "../lib/upload-config";

type UploadStatus = {
  filename: string;
  status: "pending" | "uploading" | "completed" | "failed";
};

export function useMultipartUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadStatus>>({});

  async function uploadFile(
    file: File,
    submissionId: string,
    creatorCollaborationId: string,
    batchId: string,
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
          submissionId,
          creatorCollaborationId,
          batchId,
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
        await uploadMultipart(file, key, uploadId, partUrls, batchId);
      } else {
        await uploadSingle(file, uploadUrl, key, batchId);
      }

      setUploads((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "completed" },
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      setUploads((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "failed" },
      }));
      throw error;
    }
  }

  async function uploadSingle(file: File, uploadUrl: string, key: string, batchId: string) {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    await fetch("/api/uploads/submission/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        submissionId: batchId,
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
    batchId: string,
  ) {
    const chunkSize = UPLOAD_CONFIG.chunkSize;

    // Upload all parts directly to R2 in parallel using presigned URLs
    const parts = await Promise.all(
      partUrls.map(async (partUrl, i) => {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const response = await fetch(partUrl, { method: "PUT", body: chunk });
        const etag = response.headers.get("ETag") ?? "";
        return { PartNumber: i + 1, ETag: etag.replace(/"/g, "") };
      }),
    );

    await fetch("/api/uploads/submission/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
        submissionId: batchId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    });
  }

  return { uploads, uploadFile };
}
