"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteEmailSchema } from "./schema";
import { actionClient } from "@/lib/safe-action";

export const deleteEmail = actionClient
  .schema(deleteEmailSchema)
  .action(async ({ parsedInput: { id } }) => {
    await db.email.delete({
      where: { id },
    });
    revalidatePath("/config");
    return { success: "Email deleted successfully!" };
  });
