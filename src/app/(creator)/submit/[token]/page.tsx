import { eq } from "drizzle-orm";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { campaigns, links } from "@/db/schema";
import { WizardShell } from "@/features/wizard/components/wizard-shell";
import { db } from "@/shared/lib/db";

export const metadata: Metadata = {
  title: "inBeat - Asset Submissions",
};

export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await db.query.links.findFirst({
    where: eq(links.token, token),
  });

  if (!link) {
    notFound();
  }

  if (link.status === "used") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-10" />
          <div>
            <h1 className="text-2xl font-semibold">Submission Complete!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Thank you for your submission.</p>
          </div>
        </div>
      </div>
    );
  }

  if (link.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Not Available</h1>
            <p className="mt-2 text-sm text-muted-foreground">This link is {link.status}.</p>
          </div>
        </div>
      </div>
    );
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">This submission link has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, link.campaignId),
  });

  if (!campaign) {
    notFound();
  }

  return <WizardShell token={token} campaignName={campaign.name} />;
}
