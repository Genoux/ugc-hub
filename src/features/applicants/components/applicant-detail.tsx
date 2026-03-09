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
import { approveApplicant } from "../actions/approve-applicant";
import { reinviteCreator } from "../actions/reinvite-creator";
import { rejectApplicant } from "../actions/reject-applicant";

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
    <Button
      variant="ghost"
      onClick={handleCopy}
      className="w-full flex-wrap justify-between py-3 px-3 h-auto rounded-lg hover:bg-muted/50 font-normal"
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
    <div className="flex gap-2 items-center justify-between py-3 px-3">
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
              {creator.fullName}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {creator.country}
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
            <Button onClick={handleApprove} disabled={isPending}>
              Invite to Pool
            </Button>
            <Button onClick={handleReject} disabled={isPending} variant="outline">
              Reject
            </Button>
          </div>
        )}

        {showReinviteAction && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={handleApprove}
              disabled={isPending}
              variant="outline"
              className="w-full h-12"
            >
              {isPending ? "Sending…" : "Re-invite to pool"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
