"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { upsertIdleReportDataSchema } from "./schemas";
import { actionClient } from "@/lib/safe-action";

export const upsertIdleReport = actionClient
  .schema(upsertIdleReportDataSchema)
  .action(async ({ parsedInput: { id, ...data } }) => {
    upsertIdleReportDataSchema.parse(data);
    await db.idle_monthly_top_defects.update({
      where: { id },
      data,
    });
    revalidatePath("/idle/report", "page");
    revalidatePath("/idle/report/_components/table-dropdown-menu-report");
    revalidatePath("/");
  });
