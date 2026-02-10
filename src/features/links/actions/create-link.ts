"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { links, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { createLinkSchema } from "../schemas";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function createLink(input: z.infer<typeof createLinkSchema>) {
  const data = createLinkSchema.parse(input);
  const token = generateToken();

  const [link] = await db
    .insert(links)
    .values({
      campaignId: data.campaignId,
      token,
      expiresAt: data.expiresAt || null,
      status: "active",
    })
    .returning();

  await db.insert(submissions).values({
    campaignId: data.campaignId,
    linkId: link.id,
    status: "awaiting",
  });

  revalidatePath(`/campaigns/${data.campaignId}`);
  return link;
}
