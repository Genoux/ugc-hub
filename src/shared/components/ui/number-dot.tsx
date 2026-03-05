interface NumberDotProps {
  count: number;
}

export function NumberDot({ count }: NumberDotProps) {
  if (count <= 0) return null;

  return (
    <span className="ml-0.5 text-[10px] bg-muted-foreground/10 font-bold rounded-full h-4 w-4 flex items-center justify-center text-muted-foreground">
      {count}
    </span>
  );
}
