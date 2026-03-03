"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { cn } from "@/shared/lib/utils";

const SIZE = {
  sm: "w-42",
  md: "w-52",
  lg: "w-64",
} as const;

type AssetCardProps = {
  src: string | null;
  filename: string;
  isLoading?: boolean;
  action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  buttonIcon?: React.ReactNode;
  buttonTooltip?: string;
  size?: keyof typeof SIZE;
  className?: string;
};

export function AssetCard({ src, filename, isLoading, action, buttonIcon, buttonTooltip, size, className }: AssetCardProps) {
  const [ready, setReady] = useState(false);

  return (
    <fieldset
      className={cn(
        "break-inside-avoid relative group rounded-lg overflow-hidden bg-muted shrink-0 border-none p-0 m-0",
        size ? SIZE[size] : "w-full",
        className,
      )}
    >
      {/* Ratio anchor — video content is always 9:16 */}
      <div className="relative aspect-9/16 w-full bg-muted">
        {(isLoading || !ready) && <div className="absolute inset-0 animate-pulse bg-muted" />}

        {!isLoading && src && (
          <motion.video
            src={src}
            controls
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.3, ease: EASING_FUNCTION.exponential }}
            onLoadedMetadata={() => setReady(true)}
          >
            <track kind="captions" />
          </motion.video>
        )}

        {/* Top overlay: filename + actions */}
        <div className="flex items-start justify-between p-2 absolute top-0 left-0 w-full h-14 bg-linear-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="truncate px-2 py-1 text-sm text-white">{filename}</p>
          {action && (
            buttonTooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={action}
                      className="pointer-events-auto h-8 w-8 text-white! hover:bg-white/20"
                    >
                      {buttonIcon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{buttonTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={action}
                className="pointer-events-auto h-8 w-8 text-white! hover:bg-white/20"
              >
                {buttonIcon}
              </Button>
            )
          )}
        </div>
      </div>
    </fieldset>
  );
}
