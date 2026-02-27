"use client";

import { CameraIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useCreatorAssetUpload } from "@/features/creators/hooks/use-creator-asset-upload";
import type { ProfilePhotoManager } from "@/features/creators/hooks/use-profile-photo-manager";
import { Button } from "@/shared/components/ui/button";

interface Props {
  photoKey: string;
  photoManager: ProfilePhotoManager;
  onChange: (profilePhotoKey: string) => void;
  creatorId: string;
}

export function StepPhoto({ photoKey, photoManager, onChange, creatorId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, error } = useCreatorAssetUpload(creatorId, "profile_picture");

  const hasPhoto = !!photoManager.previewUrl || !!photoKey;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (photoManager.previewUrl) URL.revokeObjectURL(photoManager.previewUrl);
    photoManager.setPreviewUrl(URL.createObjectURL(file));

    photoManager.setUploading(true);
    try {
      const { key } = await upload(file);
      onChange(key);
    } catch {
      photoManager.setPreviewUrl(null);
    } finally {
      photoManager.setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-5 py-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        disabled={photoManager.isUploading}
        aria-label="Profile photo"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={photoManager.isUploading}
        className="bg-muted hover:bg-muted/80 relative flex h-52 w-52 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={hasPhoto ? "Replace photo" : "Upload photo"}
      >
        {photoManager.previewUrl ? (
          <Image src={photoManager.previewUrl} alt="Creator" fill className="object-cover" />
        ) : (
          <CameraIcon className="size-5 text-muted-foreground" />
        )}
      </button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={photoManager.isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {photoManager.isUploading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Uploading…
          </>
        ) : hasPhoto ? (
          "Replace photo"
        ) : (
          "Upload photo"
        )}
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-muted-foreground text-xs">JPG, PNG or WebP · Max 5 MB</p>
    </div>
  );
}
