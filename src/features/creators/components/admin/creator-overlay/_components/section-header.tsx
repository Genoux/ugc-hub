interface SectionHeaderProps {
  title: string;
  count?: number;
  className?: string;
}

export function SectionHeader({ title, count, className }: SectionHeaderProps) {
  return (
    <h2
      className={`text-base font-semibold text-foreground flex items-center gap-1 ${className ?? ""}`}
    >
      {title}
      {count != null && (
        <span className="text-muted-foreground font-normal">({count})</span>
      )}
    </h2>
  );
}
