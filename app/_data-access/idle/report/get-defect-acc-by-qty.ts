"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface DefectQtyAccDataDto {
  month: string;
  line: string;
  secondary_cause_dept: string;
  idle_count: number;
  idle_porcent: string;
  idle_procent_acc: string;
}

export const getDefectQtyAccData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<DefectQtyAccDataDto[]> => {
  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;

  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;

  const result = await db.$queryRaw<DefectQtyAccDataDto[]>`
    WITH base_data AS (
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month,
        CASE 
          WHEN ${line} = 'All' OR ${line} IS NULL THEN 'All Lines'
          ELSE line 
        END AS line,
        secondary_cause_dept,
        COUNT(*) AS idle_count
      FROM idle
      WHERE DATE_FORMAT(date, '%Y-%m') = ${targetMonth}
      AND idle_rework_code_1 = 'Controllable'
      ${orgFilter}
      ${lineFilter}
      GROUP BY 
        DATE_FORMAT(date, '%Y-%m'),
        CASE 
          WHEN ${line} = 'All' OR ${line} IS NULL THEN 'All Lines'
          ELSE line 
        END,
        secondary_cause_dept
    ),
    top_5_idle AS (
      SELECT *
      FROM base_data
      ORDER BY idle_count DESC
      LIMIT 5
    ),
    total_top_5 AS (
      SELECT SUM(idle_count) as total_sum
      FROM top_5_idle
    ),
    andon_data AS (
      SELECT
        t5.month,
        t5.line,
        t5.secondary_cause_dept,
        t5.idle_count,
        CAST(ROUND((t5.idle_count * 100.0 / tt5.total_sum), 5) AS CHAR) AS idle_porcent
      FROM
        top_5_idle t5
        CROSS JOIN total_top_5 tt5
    )
    SELECT
      month,
      line,
      secondary_cause_dept,
      idle_count,
      idle_porcent,
      CAST(ROUND(
        SUM(CAST(idle_porcent AS DECIMAL(10,5))) OVER (ORDER BY idle_count DESC),
        5
      ) AS CHAR) AS idle_procent_acc
    FROM
      andon_data
    ORDER BY
      idle_count DESC,
      month,
      secondary_cause_dept,
      line
  `;

  revalidatePath("/idle/report");
  return result;
};
