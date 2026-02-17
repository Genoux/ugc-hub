"use client";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import type { CreatorUIState } from "../lib/get-creator-ui-state";

interface ProfileStateBannerProps {
  uiState: CreatorUIState;
  onOpenWizard?: () => void;
}

const BANNER_CONFIG = {
  onboarding: {
    message: "Complete your profile to submit your application.",
    cta: "Complete profile",
  },
  direct_invite_pending: {
    message: "Complete your profile to go live in the creator database.",
    cta: "Complete profile",
  },
  under_review: {
    message: "Your profile is under review — we'll notify you within 1–3 business days.",
  },
  approved_incomplete: {
    message: "You've been approved! Complete your full profile to go live.",
    cta: "Complete profile",
  },
  live: {
    message: "Your profile is live and discoverable by brands.",
  },
  declined: {
    variant: "destructive" as const,
    message: "Your application was not approved at this time.",
  },
} satisfies Partial<Record<CreatorUIState, { variant?: "default" | "destructive"; message: string; cta?: string }>>;

export function ProfileStateBanner({ uiState, onOpenWizard }: ProfileStateBannerProps) {
  const config = BANNER_CONFIG[uiState as keyof typeof BANNER_CONFIG];
  if (!config) return null;

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
