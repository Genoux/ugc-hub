import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import type { SocialPlatform } from "@/shared/lib/constants";
import { Button } from "../../ui/button";
import { InstagramIcon } from "./instagram";
import { TikTokIcon } from "./tiktok";
import { YouTubeIcon } from "./youtube";

interface SocialIconProps {
  name: SocialPlatform;
  url: string;
}

export function SocialIcon({ name, url }: SocialIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => window.open(url, "_blank")}>
          {name === "Instagram" && <InstagramIcon />}
          {name === "TikTok" && <TikTokIcon />}
          {name === "YouTube" && <YouTubeIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{url}</p>
      </TooltipContent>
    </Tooltip>
  );
}
