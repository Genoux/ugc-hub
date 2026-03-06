"use client";

import { Check, Copy, ExternalLink, MoreVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Creator } from "@/features/applicants/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { approveApplicant } from "../actions/approve-applicant";
import { reinviteCreator } from "../actions/reinvite-creator";
import { rejectApplicant } from "../actions/reject-applicant";
import { revokeInvitation } from "../actions/revoke-invitation";

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

function LinkRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
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

  const handleRevokeInvitation = () => {
    startTransition(async () => {
      try {
        await revokeInvitation(creator.id);
        toast.success("Invitation revoked");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to revoke invitation");
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

  const showActionsMenu = showResendAction;

  return (
    <div className="w-full animate-in fade-in duration-150">
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-start gap-4 pb-5">
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="mb-2">
              {creator.source === "applicant"
                ? "Applied"
                : creator.source === "direct_invite"
                  ? "Invited by email"
                  : "Unknown"}
            </Badge>
            <h2 className="text-xl font-semibold text-foreground">
              {creator.fullName || creator.email}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {creator.country || "Location not specified"}
            </p>
          </div>
          {showActionsMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReinvite} disabled={isPending}>
                  {isPending ? "Sending…" : "Resend invitation"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRevokeInvitation}
                  disabled={isPending}
                  className="text-destructive focus:text-destructive"
                >
                  Revoke invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                <Button onClick={handleApprove} disabled={isPending}>
                  Invite to Pool
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve and send invite to join the pool</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleReject} disabled={isPending} variant="outline">
                  Reject
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject this application</TooltipContent>
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
                  {isPending ? "Sending…" : "Re-invite to pool"}
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
