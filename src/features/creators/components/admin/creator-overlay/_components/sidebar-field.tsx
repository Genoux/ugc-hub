interface SidebarFieldProps {
  label: string;
  value?: string | null;
}

export function SidebarField({ label, value }: SidebarFieldProps) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
