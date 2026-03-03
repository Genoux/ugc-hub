import { cn } from "@/shared/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCard({ children, className }: BentoCardProps) {
  return (
    <div className={cn("bg-cream/50 rounded-lg p-3 flex flex-col gap-2 justify-center", className)}>
      {children}
    </div>
  );
}
