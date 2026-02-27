"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function ThemedSignIn({ fallbackRedirectUrl }: { fallbackRedirectUrl: string }) {
  const { resolvedTheme } = useTheme();
  const appearance = resolvedTheme === "dark" ? { baseTheme: dark } : undefined;

  return <SignIn fallbackRedirectUrl={fallbackRedirectUrl} appearance={appearance} />;
}
