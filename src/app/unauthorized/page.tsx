import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/shared/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold">Access restricted</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        You don't have access to this application. If you received an invite, make sure you're
        signing in with the invited email address.
      </p>
      <SignOutButton redirectUrl="/sign-in">
        <Button variant="outline">Sign out</Button>
      </SignOutButton>
    </div>
  );
}
