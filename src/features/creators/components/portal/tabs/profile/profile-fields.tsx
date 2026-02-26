export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function Tags({ values }: { values: string[] | null | undefined }) {
  if (!values?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full border border-border py-1.5 px-3 text-xs font-medium text-foreground"
        >
          {v}
        </span>
      ))}
    </div>
  );
}
