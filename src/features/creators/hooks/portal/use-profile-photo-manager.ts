"use client";

import { useRef, useState } from "react";

export interface ProfilePhotoManager {
  previewUrl: string | null;
  pendingFile: File | null;
  setPreviewUrl: (url: string | null) => void;
  setPendingFile: (file: File | null) => void;
  /** Revoke the pending objectUrl and restore the original preview URL. */
  revertPending: () => void;
}

export function useProfilePhotoManager(initialPreviewUrl?: string | null): ProfilePhotoManager {
  const initialRef = useRef(initialPreviewUrl ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const revertPending = () => {
    if (pendingFile && previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(initialRef.current);
    setPendingFile(null);
  };

  return { previewUrl, pendingFile, setPreviewUrl, setPendingFile, revertPending };
}
