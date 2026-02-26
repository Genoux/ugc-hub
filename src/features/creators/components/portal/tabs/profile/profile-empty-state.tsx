import { Ban, Hourglass, type LucideIcon, Sticker } from "lucide-react";
import type { CreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ProfileEmptyStateProps {
  uiState: Exclude<CreatorUIState, "live">;
  creatorName: string;
  onOpenOnboarding?: () => void;
}

const CONFIG = {
  pending_approval: {
    Icon: Hourglass,
    title: (name: string) => `Hey ${name}`,
    description:
      "Your application is being reviewed by the team. Your profile will appear here once approved.",
  },
  pending_profile: {
    Icon: Sticker,
    title: (name: string) => `Hey ${name}`,
    description: "Complete your profile to go live in the creator database.",
    cta: "Complete profile",
  },
  declined: {
    Icon: Ban,
    title: (_name: string) => "Application declined",
    description: "Your application was not approved at this time.",
  },
} satisfies Record<
  Exclude<CreatorUIState, "live">,
  { Icon: LucideIcon; title: (name: string) => string; description: string; cta?: string }
>;

function ProfileSkeleton() {
  return (
    <div className="p-6 grid grid-cols-12 gap-16 w-full">
      <div className="col-span-4 flex flex-col gap-4">
        <Skeleton className="w-full h-80 rounded-lg" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
      <div className="col-span-8 flex flex-col gap-5">
        <Skeleton className="h-12 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="aspect-video rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProfileEmptyState({
  uiState,
  creatorName,
  onOpenOnboarding,
}: ProfileEmptyStateProps) {
  const config = CONFIG[uiState];
  const { Icon, title, description } = config;
  const cta = "cta" in config ? config.cta : undefined;

  return (
    <div className="relative flex-1 min-h-0">
      {uiState !== "declined" ? <ProfileSkeleton /> : null}

      <div className="absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm bg-black/2 border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon size={16} />
            </EmptyMedia>
            <EmptyTitle>{title(creatorName)}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {cta && (
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenOnboarding?.()}
                disabled={!onOpenOnboarding}
              >
                {cta}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    </div>
  );
}
