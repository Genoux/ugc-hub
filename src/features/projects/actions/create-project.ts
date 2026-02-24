"use server";

import { randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { projects } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { projectSchema } from "../schemas";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function createProject(input: z.infer<typeof projectSchema>) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");

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
}
