import type { SocialPlatform } from "@/features/creators/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Button } from "../../ui/button";
import { InstagramIcon } from "./instagram";
import { TikTokIcon } from "./tiktok";
import { YouTubeIcon } from "./youtube";

interface SocialIconProps {
  name: SocialPlatform;
  handle: string;
}

export function SocialIcon({ name, handle }: SocialIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open(`https://${name}.com/${handle}`, "_blank")}
        >
          {name === "Instagram" && <InstagramIcon />}
          {name === "TikTok" && <TikTokIcon />}
          {name === "YouTube" && <YouTubeIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{handle}</p>
      </TooltipContent>
    </Tooltip>
  );
}
