import { Check } from "lucide-react";

export function Step9Complete() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <Check className="size-8 text-green-600" />
      </div>
      <div>
        <h3 className="font-semibold">You're all set!</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Your profile is complete. Brands will now be able to discover you.
        </p>
      </div>
    </div>
  );
}
