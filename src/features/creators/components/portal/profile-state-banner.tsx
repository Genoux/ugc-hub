"use client";

import { X } from "lucide-react";
import { useCallback, useState } from "react";
import type { CreatorUIState } from "@/features/creators/components/portal/creator-portal-shell";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProfileStateBannerProps {
  uiState: CreatorUIState;
  onOpenOnboarding?: () => void;
}

const BANNER_CONFIG = {
  pending_approval: {
    className: "border-amber-200/70 bg-amber-50/50 text-amber-800",
    title: "Pending approval",
    message: "Your application is under review. We'll notify you once approved.",
  },
  pending_profile: {
    className: "border-orange-200/70 bg-orange-50/50 text-orange-800",
    title: "Complete your profile",
    message: "Fill out your profile to appear in the creator database.",
    cta: "Get started",
  },
  live: {
    className: "border-emerald-200/70 bg-emerald-50/50 text-emerald-800",
    title: "Your profile is live",
    message: "Welcome! You're now visible to brands and can receive collaboration invitations by email.",
    dismissable: true,
  },
  declined: {
    className: "border-red-200/70 bg-red-50/50 text-red-800",
    title: "Application declined",
    message: "Your application was not approved at this time.",
  },
} satisfies Record<
  CreatorUIState,
  { className: string; title: string; message: string; cta?: string; dismissable?: true }
>;

const DISMISS_KEY = "ugc-banner-live-dismissed";

function getLiveDismissed() {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function ProfileStateBanner({ uiState, onOpenOnboarding }: ProfileStateBannerProps) {
  const config = BANNER_CONFIG[uiState];
  const [dismissed, setDismissed] = useState(() => uiState === "live" && getLiveDismissed());

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const isDismissable = "dismissable" in config;
  const hasCta = "cta" in config && onOpenOnboarding;

  return (
    <Alert
      className={cn("flex items-center justify-between gap-3 py-2.5 px-3.5", config.className)}
    >
      <div className="min-w-0">
        <AlertTitle className="text-[13px] font-medium leading-snug">{config.title}</AlertTitle>
        <AlertDescription className="text-[12px] mt-0.5 text-current/65">
          {config.message}
        </AlertDescription>
      </div>

      {hasCta && (
        <Button
          type="button"
          size="xs"
          variant="outline"
          className="shrink-0 border-current/25 bg-transparent text-current hover:bg-current/8 hover:text-current"
          onClick={onOpenOnboarding}
        >
          {config.cta}
        </Button>
      )}

      {isDismissable && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-45 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <X className="size-3.5" />
        </button>
      )}
    </Alert>
  );
}
