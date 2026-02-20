"use client";

import type { CreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

interface ProfileStateBannerProps {
  uiState: CreatorUIState;
  onOpenWizard?: () => void;
}

const BANNER_CONFIG = {
  pending_approval: {
    message: "Your application is pending admin review — we'll notify you once approved.",
  },
  pending_profile: {
    message: "Complete your profile to go live in the creator database.",
    cta: "Complete profile",
  },
  live: {
    message: "Your profile is live and discoverable by brands.",
  },
  declined: {
    variant: "destructive" as const,
    message: "Your application was not approved at this time.",
  },
} satisfies Record<
  CreatorUIState,
  { variant?: "default" | "destructive"; message: string; cta?: string }
>;

export function ProfileStateBanner({ uiState, onOpenWizard }: ProfileStateBannerProps) {
  const config = BANNER_CONFIG[uiState];

  return (
    <Alert variant={"variant" in config ? config.variant : "default"}>
      <AlertDescription className="flex items-center justify-between gap-4">
        {config.message}
        {"cta" in config && config.cta && onOpenWizard && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={onOpenWizard}>
            {config.cta}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
