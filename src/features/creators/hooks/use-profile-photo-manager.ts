"use client";

import { useState } from "react";

export interface ProfilePhotoManager {
  previewUrl: string | null;
  isUploading: boolean;
  setPreviewUrl: (url: string | null) => void;
  setUploading: (uploading: boolean) => void;
}

export function useProfilePhotoManager(initialPreviewUrl?: string | null): ProfilePhotoManager {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [isUploading, setUploading] = useState(false);
  return { previewUrl, isUploading, setPreviewUrl, setUploading };
}
