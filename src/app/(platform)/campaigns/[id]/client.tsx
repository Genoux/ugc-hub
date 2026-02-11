"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCreateLinkMutation } from "@/features/links/hooks/use-links-mutations";
import { SubmissionList } from "@/features/submissions/components/submission-list";
import { useRealtimeSubmissions } from "@/features/submissions/hooks/use-realtime-submissions";
import { Button } from "@/shared/components/ui/button";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
};

type Submission = {
  id: string;
  creatorName: string | null;
  creatorEmail: string | null;
  status: string;
  createdAt: Date;
  link?: {
    id: string;
    token: string;
    status: string;
  };
};

export function CampaignDetailClient({
  campaign,
  submissions,
}: {
  campaign: Campaign;
  submissions: Submission[];
}) {
  useRealtimeSubmissions(campaign.id);
  const createLinkMutation = useCreateLinkMutation(campaign.id);

  function handleCreateLink() {
    createLinkMutation.mutate({ campaignId: campaign.id });
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4">
      <div className="flex">
        <Button variant="outline" size="sm" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="size-4" />
            Campaigns
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          )}
        </div>
      </div>

      <SubmissionList
        campaignId={campaign.id}
        submissions={submissions}
        onCreateLink={handleCreateLink}
        isCreatingLink={createLinkMutation.isPending}
      />
    </div>
  );
}
