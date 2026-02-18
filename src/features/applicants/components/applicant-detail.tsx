"use client";

import { Check, Copy, ExternalLink, Globe, Instagram, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Creator } from "@/features/applicants/types";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { approveApplicant } from "../actions/approve-applicant";
import { rejectApplicant } from "../actions/reject-applicant";
import { reinviteCreator } from "../actions/reinvite-creator";

type ActiveTab = Creator["status"];

interface Props {
  creator: Creator;
  activeTab: ActiveTab;
}

function EmailRow({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleCopy}
          className="w-full justify-between py-3 px-3 h-auto rounded-lg hover:bg-muted/50 font-normal"
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-foreground" />
            Email
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
            {email}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : "Click to copy email"}</TooltipContent>
    </Tooltip>
  );
}

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-3.5 w-3.5 text-foreground" />,
  TikTok: (
    <svg
      className="h-3.5 w-3.5 text-foreground"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <title>TikTok</title>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.29 0 .57.04.84.11v-3.5a6.37 6.37 0 0 0-.84-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 3.76.97V6.69Z" />
    </svg>
  ),
  Portfolio: <Globe className="h-3.5 w-3.5 text-foreground" />,
};

function LinkRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        {PLATFORM_ICON[label]}
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
        {value}
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    </a>
  );
}

function MutedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-muted-foreground italic">{value}</span>
    </div>
  );
}

export function ApplicantDetail({ creator, activeTab }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveApplicant(creator.id);
        toast.success("Creator approved and invited");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to approve");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        await rejectApplicant(creator.id);
        toast.success("Applicant rejected");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reject");
      }
    });
  };

  const handleReinvite = () => {
    startTransition(async () => {
      try {
        await reinviteCreator(creator.id);
        toast.success("Invitation resent");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
      }
    });
  };

  const showApproveActions = activeTab === "applicant";
  const showResendAction = activeTab === "approved_not_joined";
  const showReinviteAction = activeTab === "rejected";

  const socialChannels = creator.socialChannels as {
    instagram_handle?: string;
    tiktok_handle?: string;
    youtube_handle?: string;
  } | null;

  return (
    <div className="w-full animate-in fade-in duration-150">
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 pb-5">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-2xl font-semibold">
              {creator.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">{creator.fullName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {creator.country || "Location not specified"}
            </p>
          </div>
        </div>

        <div>
          <EmailRow email={creator.email} />
          {socialChannels?.instagram_handle ? (
            <LinkRow
              label="Instagram"
              value={`@${socialChannels.instagram_handle}`}
              href={`https://instagram.com/${socialChannels.instagram_handle}`}
            />
          ) : (
            <MutedRow label="Instagram" value="Not available" />
          )}
          {socialChannels?.tiktok_handle ? (
            <LinkRow
              label="TikTok"
              value={`@${socialChannels.tiktok_handle}`}
              href={`https://tiktok.com/@${socialChannels.tiktok_handle}`}
            />
          ) : (
            <MutedRow label="TikTok" value="Not available" />
          )}
          {creator.portfolioUrl ? (
            <LinkRow
              label="Portfolio"
              value={creator.portfolioUrl.replace("https://", "")}
              href={creator.portfolioUrl}
            />
          ) : (
            <MutedRow label="Portfolio" value="Not available" />
          )}
        </div>

        {showApproveActions && (
          <div className="mt-6 pt-4 border-t border-border flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleApprove} disabled={isPending} className="flex-1 h-12">
                  Invite to Pool
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve and send invite to join the pool</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleReject}
                  disabled={isPending}
                  variant="outline"
                  className="flex-1 h-12 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                >
                  Reject
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject this application</TooltipContent>
            </Tooltip>
          </div>
        )}

        {showResendAction && (
          <div className="mt-6 pt-4 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleReinvite}
                  disabled={isPending}
                  variant="outline"
                  className="w-full h-12"
                >
                  {isPending ? "Sending..." : "Resend Invitation"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resend the Clerk invitation email</TooltipContent>
            </Tooltip>
          </div>
        )}

        {showReinviteAction && (
          <div className="mt-6 pt-4 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleApprove}
                  disabled={isPending}
                  variant="outline"
                  className="w-full h-12"
                >
                  Invite to Pool
                </Button>
              </TooltipTrigger>
              <TooltipContent>Re-invite this creator to the pool</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
