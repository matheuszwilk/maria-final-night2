"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface IdleRawDataDto {
  id: string;
  organization: string | null;
  date: string | null; // Changed to string since we'll format the date
  line: string | null;
  start_time: string | null;
  end_time: string | null;
  idle_time: number | null;
  head_count: number | null;
  man_hour: number | null;
  primary_cause_dept: string | null;
  secondary_cause_dept: string | null;
  work_order: string | null;
  model: string | null;
  idle_rework_code_1: string | null;
  idle_rework_code_2: string | null;
  idle_rework_code_3: string | null;
  idle_rework_code_4: string | null;
  idle_rework_code: string | null;
  part_no: string | null;
  vendor: number | null;
  contents: string | null;
  action_content: string | null;
  cause_process: number | null;
  update_user: string | null;
  update_date: string | null;
  source_of_data_input: string | null;
  real_line: string | null;
}

export const getIdleRawDataMonth = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<IdleRawDataDto[]> => {
  // Parse target month from URL parameter (e.g. "2024-01")
  const [year, month] = targetMonth.split("-").map(Number);

  // Create date range for the target month
  const startDate = new Date(Date.UTC(year, month - 1, 1)); // First day of month at 00:00:00 UTC
  const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month at 00:00:00 UTC

  const result = await db.idle.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      idle_rework_code_1: "Controllable",
      ...(org && org !== "All" ? { organization: org } : {}),
      ...(line && line !== "All" ? { line: line } : {}),
    },
    orderBy: {
      date: "desc",
    },
  });

  // Format the date in each result
  const formattedResult = result.map((item) => ({
    ...item,
    date: item.date ? item.date.toISOString().split("T")[0] : null,
  }));

  revalidatePath("/idle/table/idle");
  return formattedResult;
};
