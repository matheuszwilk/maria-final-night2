"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TargetSchema } from "./schema";
import { z } from "zod";

export const createTargetAction = async (
  values: z.infer<typeof TargetSchema>
) => {
  const validatedFields = TargetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { projectName, organization, line, year, target } =
    validatedFields.data;

  const existingTarget = await db.target.findFirst({
    where: {
      projectName: projectName,
      line: line,
      year: year,
    },
  });

  if (existingTarget) {
    return { error: "Target already exists!" };
  }

  const newTarget = await db.target.create({
    data: {
      projectName,
      organization,
      line,
      year,
      target,
    },
  });

  revalidatePath("/config");
  return { success: "Target created successfully!", target: newTarget };
};
