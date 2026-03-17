import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

export type InviteOutcome = "sent" | "has_account";

export type BulkInviteResult = {
  sent: number;
  skipped: number;
};

async function revokePendingInvitations(email: string): Promise<void> {
  const client = await clerkClient();
  const { data } = await client.invitations.getInvitationList({ query: email, status: "pending" });
  // Clerk's query param does substring matching; filter to exact address before revoking
  const matching = data.filter((inv) => inv.emailAddress === email);
  await Promise.all(matching.map((inv) => client.invitations.revokeInvitation(inv.id)));
}

export async function sendInvitation(
  email: string,
  redirectUrl: string,
): Promise<InviteOutcome> {
  const client = await clerkClient();

  try {
    await revokePendingInvitations(email);

    await client.invitations.createInvitation({ emailAddress: email, redirectUrl });
    return "sent";
  } catch (err) {
    if (isClerkAPIResponseError(err)) {
      // 422 = user already has a Clerk account, they can sign in directly
      if (err.status === 422) return "has_account";

      Sentry.captureException(err, {
        extra: { email, code: err.errors?.[0]?.code, errors: err.errors },
      });

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
      Sentry.captureException(err, {
        extra: { code: err.errors?.[0]?.code, errors: err.errors },
      });
      throw new Error("Invitation service unavailable. Please try again later.");
    }
    throw err;
  }
}
