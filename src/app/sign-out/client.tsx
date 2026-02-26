"use client";

import { useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/shared/lib/routes";

export default function SigningOutClient() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  useEffect(() => {
    signOut({ redirectUrl: `${ROUTES.signIn}${reason ? `?reason=${reason}` : ""}` });
  }, [signOut, reason]);

  return null;
}
