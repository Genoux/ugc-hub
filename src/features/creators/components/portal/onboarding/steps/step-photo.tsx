"use client";

import { CameraIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ProfilePhotoManager } from "@/features/creators/hooks/portal/use-profile-photo-manager";
import { Button } from "@/shared/components/ui/button";
import { UPLOAD_SIZE_LIMITS } from "@/shared/lib/constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  photoKey: string;
  photoManager: ProfilePhotoManager;
  onChange: (profilePhotoKey: string) => void;
  creatorId: string;
}

export function StepPhoto({ photoKey, photoManager, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPhoto = !!photoManager.previewUrl || !!photoKey;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WebP files are allowed.");
      return;
    }
    if (file.size > UPLOAD_SIZE_LIMITS.image) {
      setError("File exceeds the 5 MB limit.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (photoManager.pendingFile && photoManager.previewUrl) {
      URL.revokeObjectURL(photoManager.previewUrl);
    }

    photoManager.setPreviewUrl(objectUrl);
    photoManager.setPendingFile(file);
    // Sentinel signals a file is staged but not yet uploaded — canProceed(5) checks for non-empty string.
    onChange("__pending__");
  };

  return (
    <div className="flex flex-col items-start gap-5 py-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Profile photo"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="bg-muted hover:bg-muted/80 relative flex h-52 w-52 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-colors"
        aria-label={hasPhoto ? "Replace photo" : "Upload photo"}
      >
        {photoManager.previewUrl ? (
          <Image
            src={photoManager.previewUrl}
            alt="Creator"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <CameraIcon className="size-5 text-muted-foreground" />
        )}
      </button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        {hasPhoto ? "Replace photo" : "Upload photo"}
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-muted-foreground text-xs">JPG, PNG or WebP · Max 5 MB</p>
    </div>
  );
}
