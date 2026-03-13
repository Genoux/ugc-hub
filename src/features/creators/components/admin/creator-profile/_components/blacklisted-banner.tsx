import { Author } from "@/shared/components/blocks/authored-note";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { ClerkUserProfile } from "@/shared/lib/clerk";

interface BlacklistedBannerProps {
  reason: string;
  blacklistedBy: ClerkUserProfile;
}

export function BlacklistedBanner({ reason, blacklistedBy }: BlacklistedBannerProps) {
  return (
    <Alert
      variant="destructive"
      className="bg-destructive/5 shadow-xs border-destructive/20 w-full"
    >
      <AlertTitle>Blacklisted</AlertTitle>
      <AlertDescription>{reason}</AlertDescription>
      <Author className="mt-2" author={blacklistedBy} />
    </Alert>
  );
}
