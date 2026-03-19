"use client";

import { useState } from "react";
import { putToR2 } from "../lib/r2-upload";
import { UPLOAD_CONFIG } from "../lib/upload-config";

type PresignResult =
  | { uploadUrl: string; key: string; isMultipart?: false }
  | { uploadId: string; key: string; isMultipart: true; partUrls: string[] };

export type UploadResult = {
  key: string;
  uploadId?: string;
  parts?: { PartNumber: number; ETag: string }[];
};

export interface FileUploadConfig {
  presign: (file: File) => Promise<PresignResult>;
  onComplete?: (file: File, result: UploadResult) => Promise<void>;
  onProgress?: (progress: number) => void;
}

export function useFileUpload(config: FileUploadConfig): {
  upload: (files: File[]) => Promise<void>;
  isUploading: boolean;
  progress: number;
} {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setIsUploading(true);
    setProgress(0);

    const perFileShare = 100 / files.length;
    let completedFiles = 0;

    try {
      for (const file of files) {
        const presignResult = await config.presign(file);

        let result: UploadResult;

        if (presignResult.isMultipart) {
          result = await uploadMultipart(file, presignResult, (fileProgress) => {
            const overall = completedFiles * perFileShare + (fileProgress / 100) * perFileShare;
            setProgress(overall);
            config.onProgress?.(overall);
          });
        } else {
          result = await uploadSingle(
            file,
            presignResult.uploadUrl,
            presignResult.key,
            (fileProgress) => {
              const overall = completedFiles * perFileShare + (fileProgress / 100) * perFileShare;
              setProgress(overall);
              config.onProgress?.(overall);
            },
          );
        }

        await config.onComplete?.(file, result);
        completedFiles++;
        const overall = completedFiles * perFileShare;
        setProgress(overall);
        config.onProgress?.(overall);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, progress };
}

async function uploadSingle(
  file: File,
  uploadUrl: string,
  key: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  await putToR2(
    file,
    uploadUrl,
    onProgress ? (loaded, total) => onProgress(total ? (loaded / total) * 100 : 0) : undefined,
  );
  return { key };
}

async function uploadMultipart(
  file: File,
  presign: { uploadId: string; key: string; partUrls: string[] },
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const { uploadId, key, partUrls } = presign;
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

  return { key, uploadId, parts };
}
