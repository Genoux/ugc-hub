import Image from "next/image";
import type { ClerkUserProfile } from "@/shared/lib/clerk";
import { cn } from "@/shared/lib/utils";

export interface AuthorProps {
  author: ClerkUserProfile;
  className?: string;
}

export function Author({ author, className }: AuthorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {author.imageUrl && (
        <div className="relative size-4 shrink-0">
          <Image
            src={author.imageUrl}
            alt={author.name ?? ""}
            fill
            className="rounded-full shrink-0 "
          />
        </div>
      )}
      {author.name && (
        <p className="text-xs text-muted-foreground w-full whitespace-nowrap">{author.name}</p>
      )}
    </div>
  );
}
