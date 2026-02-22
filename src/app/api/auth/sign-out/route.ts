import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/shared/lib/routes";

export async function GET(req: Request) {
  const { sessionId } = await auth();
  const reason = new URL(req.url).searchParams.get("reason") ?? "no_account";

  if (sessionId) {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
  }

  return NextResponse.redirect(new URL(`${ROUTES.signIn}?reason=${reason}`, req.url));
}
