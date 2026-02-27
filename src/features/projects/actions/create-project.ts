"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { projects } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { projectSchema } from "../schemas";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function createProject(input: z.infer<typeof projectSchema>) {
  try {
    const { userId } = await requireAdmin();

    const data = projectSchema.parse(input);

    const code = data.name.substring(0, 4).toUpperCase().replace(/\s/g, "");
    const uploadToken = generateToken();

    const [project] = await db
      .insert(projects)
      .values({
        ...data,
        userId,
        code,
        uploadToken,
      })
      .returning();

    revalidatePath("/projects");
    return project;
  } catch (err) {
    throw toActionError(err);
  }
}
