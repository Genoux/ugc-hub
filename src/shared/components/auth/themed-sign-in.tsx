"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

interface Props {
  fallbackRedirectUrl: string;
  forceRedirectUrl?: string;
}

export function ThemedSignIn({ fallbackRedirectUrl, forceRedirectUrl }: Props) {
  const { resolvedTheme } = useTheme();
  const appearance = resolvedTheme === "dark" ? { baseTheme: dark } : undefined;

  return (
    <SignIn
      forceRedirectUrl={forceRedirectUrl}
      fallbackRedirectUrl={fallbackRedirectUrl}
      appearance={appearance}
    />
  );
}
