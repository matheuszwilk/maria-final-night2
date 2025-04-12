"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { upsertAndonReportDataSchema } from "./schemas";
import { actionClient } from "@/lib/safe-action";

export const updateAndonReport = actionClient
  .schema(upsertAndonReportDataSchema)
  .action(async ({ parsedInput: { id, ...data } }) => {
    upsertAndonReportDataSchema.parse(data);
    await db.andon_monthly_top_defects.update({
      where: { id },
      data,
    });
    revalidatePath("/andon/report", "page");
    revalidatePath("/");
  });
