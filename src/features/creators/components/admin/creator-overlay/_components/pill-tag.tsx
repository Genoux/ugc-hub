interface PillTagProps {
  label: string;
}

export function PillTag({ label }: PillTagProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border py-1 px-3 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}
