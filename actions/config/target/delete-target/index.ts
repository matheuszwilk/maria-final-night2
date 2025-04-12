"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteTargetSchema } from "./schema";
import { actionClient } from "@/lib/safe-action";

export const deleteTarget = actionClient
  .schema(deleteTargetSchema)
  .action(async ({ parsedInput: { id } }) => {
    // Check if department is being used by any emails
    await db.target.findFirst({
      where: { id },
    });

    await db.target.delete({
      where: { id },
    });

    revalidatePath("/config");
    return { success: "Target deleted successfully!" };
  });
