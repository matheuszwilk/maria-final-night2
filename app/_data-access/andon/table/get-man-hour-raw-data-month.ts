"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ManHourByMonthDataDto {
  id: string;
  organization: string | null;
  line: string | null;
  shift: string | null;
  work_part: string | null;
  work_date: string | null; // Changed to string since we'll format the date
  model_or_model_suffix: string | null;
  total_working_time: number | null;
  net_working_time: number | null;
  production_quantity: number | null;
  uph: number | null;
  yield_man_hour: number | null;
  total_attendance_man_hour: number | null;
  direct_man_hour: number | null;
  indirect_man_hour: number | null;
  idle_man_hour: number | null;
  controllable_idle_man_hour: number | null;
  uncontrollable_idle_man_hour: number | null;
  rework_man_hour: number | null;
  net_working_man_hour: number | null;
  direct_on_operation: number | null;
  indirect_on_operation: number | null;
  total_on_operation: number | null;
}

export const getManHourByMonthData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<ManHourByMonthDataDto[]> => {
  // Parse target month from URL parameter (e.g. "2024-01")
  const [year, month] = targetMonth.split("-").map(Number);

  // Create date range for the target month
  const startDate = new Date(year, month - 1, 1); // month is 0-based in JS Date
  const endDate = new Date(year, month, 0); // Last day of target month

  const result = await db.manhour.findMany({
    where: {
      work_date: {
        gte: startDate,
        lte: endDate,
      },
      ...(org && org !== "All" ? { organization: org } : {}),
      ...(line && line !== "All" ? { line } : {}),
    },
    orderBy: {
      id: "asc",
    },
  });

  // Format the dates in each result
  const formattedResult = result.map((item) => ({
    ...item,
    work_date: item.work_date
      ? item.work_date.toISOString().split("T")[0]
      : null,
  }));

  revalidatePath("/andon/table/man-hour");
  return formattedResult;
};
