"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { WizardData } from "../wizard-types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function Step5Photo({ data, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, fileSize: file.size }),
      });
      if (!res.ok) throw new Error();
      const { uploadUrl, key } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      onChange({ profilePhoto: key });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {data.profilePhoto ? (
        <div className="relative">
          <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
            <Check className="size-8 text-green-600" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={() => onChange({ profilePhoto: "" })}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
          <Plus className="text-muted-foreground size-8" />
        </div>
      )}

      <label className="cursor-pointer">
        <span className="bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
          {uploading ? "Uploading…" : data.profilePhoto ? "Change photo" : "Upload photo"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-muted-foreground text-center text-xs">JPG, PNG or WebP · Max 5 MB</p>
    </div>
  );
}
