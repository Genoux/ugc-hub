"use server";

import { randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import type { z } from "zod";
import { submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { submissionSchema } from "../schemas";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function createSubmission(input: z.infer<typeof submissionSchema>) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");

  const data = submissionSchema.parse(input);

  // Generate required fields
  const code = data.name.substring(0, 4).toUpperCase().replace(/\s/g, "");
  const uploadToken = generateToken();

  const [submission] = await db
    .insert(submissions)
    .values({
      ...data,
      userId,
      code,
      uploadToken,
    })
    .returning();

  return submission;
}
