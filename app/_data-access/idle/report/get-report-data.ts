"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface IdleReportDataDto {
  id: string;
  year_month: string | null;
  date: string | null; // Changed to string since we'll format the date
  idle_rework_code_4: string | null;
  organization: string | null;
  line: string | null;
  model: string | null;
  contents: string | null;
  end_date: string | null; // Changed to string
  secondary_cause_dept: string | null;
  idle_time: number | null;
  createdAt: string | null; // Changed to string
  status: string | null;
  action_plan_file_url: string | null;
}

export const getIdleReportData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<IdleReportDataDto[]> => {
  const result = await db.idle_monthly_top_defects.findMany({
    where: {
      year_month: targetMonth,
      ...(org && org !== "All" && { organization: org }),
      ...(line && line !== "All" && { line: line }),
    },
    orderBy: [{ year_month: "asc" }, { idle_time: "desc" }],
  });

  // Format the dates in each result
  const formattedResult = result.map((item) => ({
    ...item,
    date: item.date ? item.date.toISOString().split("T")[0] : null,
    end_date: item.end_date ? item.end_date.toISOString().split("T")[0] : null,
    createdAt: item.createdAt
      ? item.createdAt.toISOString().split("T")[0]
      : null,
  }));

  revalidatePath("/idle/report");
  return formattedResult;
};
