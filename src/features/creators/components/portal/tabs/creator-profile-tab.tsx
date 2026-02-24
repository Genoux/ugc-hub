import Image from "next/image";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import { AssetCard } from "@/shared/components/asset-card";

interface CreatorProfileTabProps {
  creator: CreatorProfile;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Tags({ values }: { values: string[] | null | undefined }) {
  if (!values?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export function CreatorProfileTab({ creator }: CreatorProfileTabProps) {
  if (!creator.profileCompleted) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground border rounded-lg p-4">
        Your creator profile will appear here once it's set up.
      </div>
    );
  }

  const socials = creator.socialChannels;
  const socialLinks = [
    socials?.instagram_handle && { label: "Instagram", handle: `@${socials.instagram_handle}` },
    socials?.tiktok_handle && { label: "TikTok", handle: `@${socials.tiktok_handle}` },
    socials?.youtube_handle && { label: "YouTube", handle: `@${socials.youtube_handle}` },
  ].filter(Boolean) as { label: string; handle: string }[];

  return (
    <div className="space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        {creator.profilePhotoUrl ? (
          <Image
            src={creator.profilePhotoUrl}
            alt={creator.fullName}
            width={80}
            height={80}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-light text-muted-foreground shrink-0">
            {creator.fullName[0]}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{creator.fullName}</h2>
          {creator.primaryChannel && (
            <p className="text-sm text-muted-foreground">{creator.primaryChannel}</p>
          )}
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Country" value={creator.country} />
        <Field label="Gender" value={creator.genderIdentity} />
        <Field label="Age group" value={creator.ageDemographic} />
        <Field label="Ethnicity" value={creator.ethnicity} />
        <Field label="Languages" value={creator.languages?.join(", ")} />
        <Field
          label="Rate (self-reported)"
          value={
            creator.rateRangeSelf
              ? `$${creator.rateRangeSelf.min} – $${creator.rateRangeSelf.max} / video`
              : null
          }
        />
        <Field label="Portfolio URL" value={creator.portfolioUrl} />
      </div>

      {/* Socials */}
      {socialLinks.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Socials</p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ label, handle }) => (
              <span key={label} className="text-sm font-medium">
                <span className="text-muted-foreground">{label} </span>
                {handle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories & formats */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">UGC Categories</p>
          <Tags values={creator.ugcCategories} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Content Formats</p>
          <Tags values={creator.contentFormats} />
        </div>
      </div>

      {/* Portfolio videos */}
      {creator.portfolioVideos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Portfolio Videos</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {creator.portfolioVideos.map((video) => (
              <AssetCard key={video.id} src={video.url} filename={video.filename} isVideo />
            ))}
          </div>
        </div>
      )}

      {/* Collaboration highlights */}
      {creator.closedCollaborations.some((c) => c.highlights.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Collaboration Highlights</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {creator.closedCollaborations.flatMap((collab) =>
              collab.highlights.map((h) => (
                <AssetCard key={h.id} src={h.url} filename={h.filename} isVideo />
              )),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
