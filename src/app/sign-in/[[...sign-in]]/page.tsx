import { AlertCircle } from "lucide-react";
import { ThemedSignIn } from "@/shared/components/themed-sign-in";

const REASON_MESSAGES: Record<string, string> = {
  no_account:
    "Your account was not found. Contact your administrator if you think this is a mistake.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; reason?: string }>;
}) {
  const { redirect_url, reason } = await searchParams;
  const message = reason ? REASON_MESSAGES[reason] : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {message && (
        <div className="flex w-full max-w-sm items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      )}
      <ThemedSignIn fallbackRedirectUrl={redirect_url ?? "/"} />
    </div>
  );
}
