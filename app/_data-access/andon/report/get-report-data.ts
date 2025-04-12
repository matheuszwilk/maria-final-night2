"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AndonReportDataDto {
  id: string;
  year_month: string;
  andon_process: string;
  organization: string;
  equipment_line: string;
  reason: string;
  end_date: Date;
  cause_department: string;
  andon_time: number;
  createdAt: Date;
  status: string;
  action_plan_file_url: string | null;
}

export const getAndonReportData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<AndonReportDataDto[]> => {
  const result = await db.andon_monthly_top_defects.findMany({
    where: {
      year_month: targetMonth,
      ...(org && org !== "All" && { organization: org }),
      ...(line && line !== "All" && { equipment_line: line }),
    },
    orderBy: [{ year_month: "asc" }, { andon_time: "desc" }],
    select: {
      id: true,
      year_month: true,
      andon_process: true,
      organization: true,
      equipment_line: true,
      reason: true,
      end_date: true,
      cause_department: true,
      andon_time: true,
      status: true,
      action_plan_file_url: true,
    },
  });

  revalidatePath("/andon/report");
  return result as AndonReportDataDto[];
};
