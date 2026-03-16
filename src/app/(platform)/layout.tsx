import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PlatformShell } from "./platform-shell";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <PlatformShell>{children}</PlatformShell>
    </NuqsAdapter>
  );
}
