import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.updated") {
      const { id, email_addresses, primary_email_address_id } = evt.data;
      const primary = email_addresses.find((e) => e.id === primary_email_address_id);

      if (primary?.email_address) {
        await db
          .update(creators)
          .set({
            email: primary.email_address.toLowerCase().trim(),
            clerkUserId: id,
          })
          .where(eq(creators.clerkUserId, id));
      }
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await db
          .update(creators)
          .set({ clerkUserId: null })
          .where(eq(creators.clerkUserId, id));
      }
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err) {
    console.error("[Clerk webhook]", err);
    return new NextResponse("Verification failed", { status: 400 });
  }
}
