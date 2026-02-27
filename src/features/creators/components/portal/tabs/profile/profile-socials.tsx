interface SocialLink {
  label: string;
  handle: string;
}

export function ProfileSocials({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">Socials</p>
      <div className="flex justify-between  sm:justify-start lg:justify-between gap-3">
        {links.map(({ label, handle }) => (
          <span key={label} className="text-sm font-medium flex flex-col gap-1">
            <span className="text-muted-foreground">{label} </span>
            {handle}
          </span>
        ))}
      </div>
    </div>
  );
}
