import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { clerkClient } from "@clerk/nextjs/server";

export type InviteResult =
  | { ok: true }
  | { ok: false; reason: "already_has_account" | "already_invited" };

export type BulkInviteResult = {
  sent: number;
  skipped: number;
};

export async function sendInvitation(
  email: string,
  redirectUrl: string,
  publicMetadata?: Record<string, unknown>,
): Promise<InviteResult> {
  const client = await clerkClient();

  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl,
      ignoreExisting: true,
      ...(publicMetadata && { publicMetadata }),
    });
    return { ok: true };
  } catch (err) {
    if (isClerkAPIResponseError(err)) {
      // 422 = user already has a Clerk account, they can sign in directly
      if (err.status === 422) return { ok: false, reason: "already_has_account" };

      const code = err.errors?.[0]?.code;
      if (code === "duplicate_record") return { ok: false, reason: "already_invited" };

      // Config/infra errors are not actionable by the user
      // TODO: replace with Sentry.captureException(err) when Sentry is added
      console.error("[Clerk] sendInvitation failed:", { email, code, errors: err.errors });
      throw new Error("Invitation service unavailable. Please try again later.");
    }

    throw err;
  }
}

export type ClerkUserProfile = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  email: string | null;
};

export async function getClerkUserProfile(userId: string): Promise<ClerkUserProfile | null> {
  const client = await clerkClient();
  try {
    const user = await client.users.getUser(userId);
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
    return {
      id: userId,
      name,
      imageUrl: user.imageUrl || null,
      email: user.emailAddresses[0]?.emailAddress ?? null,
    };
  } catch {
    return null;
  }
}

export async function sendInvitationBulk(
  emails: string[],
  redirectUrl: string,
): Promise<BulkInviteResult> {
  if (emails.length === 0) return { sent: 0, skipped: 0 };

  const client = await clerkClient();

  try {
    await client.invitations.createInvitationBulk(
      emails.map((emailAddress) => ({ emailAddress, redirectUrl, ignoreExisting: true })),
    );
    return { sent: emails.length, skipped: 0 };
  } catch (err) {
    if (isClerkAPIResponseError(err)) {
      // TODO: replace with Sentry.captureException(err) when Sentry is added
      console.error("[Clerk] sendInvitationBulk failed:", {
        code: err.errors?.[0]?.code,
        errors: err.errors,
      });
      throw new Error("Invitation service unavailable. Please try again later.");
    }
    throw err;
  }
}
