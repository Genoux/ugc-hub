import { X } from "lucide-react";
import { Author } from "@/shared/components/blocks/authored-note";
import { Button } from "@/shared/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import type { ClerkUserProfile } from "@/shared/lib/clerk";

interface BlacklistedHovercardProps {
  reason: string;
  blacklistedBy: ClerkUserProfile;
}

export function BlacklistedHovercard({ reason, blacklistedBy }: BlacklistedHovercardProps) {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="link" size="icon" className="w-6 h-6 shadow-hub">
          <X
            strokeWidth={3}
            className="text-white size-5 rounded-full p-1"
            style={{
              background: "linear-gradient(120deg, #EE3A3A 40%, #941616 100%)",
            }}
          />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-3">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
          Blacklisted
        </p>
        <p className="text-sm">{reason}</p>
        <hr />
        <Author author={blacklistedBy} />
      </HoverCardContent>
    </HoverCard>
  );
}
