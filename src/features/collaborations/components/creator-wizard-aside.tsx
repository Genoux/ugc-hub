"use client";

import Image from "next/image";
import { WizardAside } from "@/shared/components/wizard/wizard";

interface CreatorWizardAsideProps {
  creatorName: string;
  profilePhotoUrl: string | null;
  profilePhotoBlurDataUrl?: string | null;
  subtitle: string;
  visible: boolean;
}

export function CreatorWizardAside({
  creatorName,
  profilePhotoUrl,
  profilePhotoBlurDataUrl,
  subtitle,
  visible,
}: CreatorWizardAsideProps) {
  return (
    <WizardAside stepKey="creator" direction={1} visible={visible}>
      <div
        className={`relative flex h-full flex-col items-center justify-center gap-4 overflow-hidden p-8 ${profilePhotoUrl ? "" : "bg-gradient-to-br from-slate-700 to-slate-900"}`}
      >
        <div className="absolute inset-0 z-10 bg-black/30" />
        <div className="absolute inset-0 z-10 backdrop-blur-md" />
        {profilePhotoUrl && (
          <Image
            src={profilePhotoUrl}
            alt=""
            fill
            unoptimized
            placeholder={profilePhotoBlurDataUrl ? "blur" : "empty"}
            blurDataURL={profilePhotoBlurDataUrl ?? undefined}
            className="object-cover"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-4">
          {profilePhotoUrl ? (
            <Image
              src={profilePhotoUrl}
              alt={creatorName}
              width={80}
              height={80}
              unoptimized
              placeholder={profilePhotoBlurDataUrl ? "blur" : "empty"}
              blurDataURL={profilePhotoBlurDataUrl ?? undefined}
              className="size-40 rounded-full object-cover shadow-hub"
            />
          ) : (
            <div className="flex size-40 items-center justify-center rounded-full bg-white/20 text-3xl font-semibold text-white shadow-hub">
              {creatorName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="text-center">
            <p className="text-2xl font-semibold text-white">{creatorName}</p>
            <p className="text-md mt-0.5 text-white/80">{subtitle}</p>
          </div>
        </div>
      </div>
    </WizardAside>
  );
}
