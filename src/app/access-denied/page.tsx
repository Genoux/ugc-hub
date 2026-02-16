"use client";

import { SignOutButton } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <AlertCircle className="size-12 text-destructive" />
        <div>
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This platform is not available to your email address.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please contact support if you believe this is an error.
          </p>
        </div>
        <SignOutButton redirectUrl="/sign-in">
          <Button variant="default">Sign Out</Button>
        </SignOutButton>
      </div>
    </div>
  );
}
