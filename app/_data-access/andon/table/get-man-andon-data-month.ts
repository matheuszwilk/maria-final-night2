"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ManAndonByMonthDataDto {
  id: string;
  no: number | null;
  chk: string | null;
  status: string | null;
  equipment_line: string | null;
  andon_process: string | null;
  andon_no: number | null;
  main_sub: string | null;
  start: Date | null;
  end: Date | null;
  run_time_hms: string | null;
  run_time_sec: number | null;
  warning_stop: string | null;
  andon_type: string | null;
  cause_department: string | null;
  reason: string | null;
  andon_time: number | null;
  organization: string | null;
}

export const getManAndonByMonthData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<ManAndonByMonthDataDto[]> => {
  // Parse target month from URL parameter (e.g. "2024-01")
  const [year, month] = targetMonth.split("-").map(Number);

  // Create date range for the target month
  const startDate = new Date(year, month - 1, 1); // month is 0-based in JS Date
  const endDate = new Date(year, month, 0); // Last day of target month

  const result = await db.andon.findMany({
    where: {
      end: {
        gte: startDate,
        lte: endDate,
      },
      ...(org && org !== "All" ? { organization: org } : {}),
      ...(line && line !== "All" ? { equipment_line: line } : {}),
    },
    orderBy: {
      id: "asc",
    },
  });

  revalidatePath("/andon/table/andon");
  return result;
};
