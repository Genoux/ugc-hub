"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ApplicantTabKey, Creator } from "@/features/applicants/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";
import { approveApplicant } from "../actions/approve-applicant";
import { reinviteCreator } from "../actions/reinvite-creator";
import { rejectApplicant } from "../actions/reject-applicant";

interface Props {
  creator: Creator;
  activeTab: Creator["status"];
  onMutationSuccess?: (destinationTab: ApplicantTabKey) => void;
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
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">Email</span>
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
      className="flex flex-wrap items-center gap-2 justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
        <span className="truncate max-w-40">{value}</span>
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

export function ApplicantDetail({ creator, activeTab, onMutationSuccess }: Props) {
  const queryClient = useQueryClient();

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approveApplicant(creator.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.applicantsPrefix });
      toast.success("Creator approved and invited");
      onMutationSuccess?.("approved_not_joined");
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: () => rejectApplicant(creator.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.applicantsPrefix });
      toast.success("Applicant rejected");
      onMutationSuccess?.("rejected");
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: reinvite, isPending: isReinviting } = useMutation({
    mutationFn: () => reinviteCreator(creator.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.applicantsPrefix });
      toast.success("Invitation resent");
      onMutationSuccess?.("approved_not_joined");
    },
    onError: (err) => toast.error(err.message),
  });

  const isPending = isApproving || isRejecting || isReinviting;

  const showApproveActions = activeTab === "applicant";
  const showResendAction = activeTab === "approved_not_joined";
  const showReinviteAction = activeTab === "rejected";

  return (
    <div className="w-full animate-in fade-in duration-150">
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-start gap-4 pb-5">
          <div className="min-w-0 flex-1 gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="mb-2">
                {creator.source === "applicant"
                  ? "Applied"
                  : creator.source === "direct_invite"
                    ? "Invited by email"
                    : "Unknown"}
              </Badge>
              {activeTab === "approved_not_joined" && (
                <Badge variant="outline" className="mb-2">
                  {creator.clerkUserId === null ? "Pending signup" : "Signed up"}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground">{creator.fullName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{creator.country}</p>
          </div>
          {showResendAction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => reinvite()} disabled={isPending}>
                  {isReinviting ? "Sending…" : "Resend invitation"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div>
          <EmailRow email={creator.email} />
          {creator.socialChannels?.instagram_url ? (
            <LinkRow
              label="Instagram"
              value={creator.socialChannels.instagram_url.replace("https://", "")}
              href={creator.socialChannels.instagram_url}
            />
          ) : (
            <MutedRow label="Instagram" value="Not available" />
          )}
          {creator.socialChannels?.tiktok_url ? (
            <LinkRow
              label="TikTok"
              value={creator.socialChannels.tiktok_url.replace("https://", "")}
              href={creator.socialChannels.tiktok_url}
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
            <Button onClick={() => approve()} disabled={isPending}>
              Invite to Pool
            </Button>
            <Button onClick={() => reject()} disabled={isPending} variant="outline">
              Reject
            </Button>
          </div>
        )}

        {showReinviteAction && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={() => approve()}
              disabled={isPending}
              variant="outline"
              className="w-full h-12"
            >
              {isApproving ? "Sending…" : "Re-invite to pool"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
