"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { resetCreatorProfile } from "@/features/creators/actions/portal/reset-creator-profile";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

export function ResetProfileButton() {
  if (process.env.NODE_ENV !== "development") return null;

  return <ResetButton />;
}

function ResetButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      await resetCreatorProfile();
      router.refresh();
    });
  };

  return (
    <div className="fixed bottom-6 left-6 z-9998">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={isPending}
            className="size-9 shadow-md bg-background opacity-40 hover:opacity-100 transition-opacity"
          >
            <RotateCcw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Reset onboarding (dev only)</TooltipContent>
      </Tooltip>
    </div>
  );
}
