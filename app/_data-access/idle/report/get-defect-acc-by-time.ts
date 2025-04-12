"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface DefectAccDataDto {
  month: string;
  line: string;
  secondary_cause_dept: string;
  idle_time: string;
  idle_porcent: string;
  idle_procent_acc: string;
}

export const getDefectAccData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<DefectAccDataDto[]> => {
  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;

  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;

  const result = await db.$queryRaw<DefectAccDataDto[]>`
    WITH raw_data AS (
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month,
        line,
        secondary_cause_dept,
        SUM(idle_time) AS idle_sum
      FROM idle
      WHERE DATE_FORMAT(date, '%Y-%m') = ${targetMonth}
      AND idle_rework_code_1 = 'Controllable'
      ${orgFilter}
      ${lineFilter}
      GROUP BY 
        DATE_FORMAT(date, '%Y-%m'),
        ${line === "All" ? Prisma.sql`secondary_cause_dept` : Prisma.sql`line, secondary_cause_dept`}
    ),
    top_5_idle AS (
      SELECT *
      FROM raw_data
      ORDER BY idle_sum DESC
      LIMIT 5
    ),
    total_top_5 AS (
      SELECT SUM(idle_sum) as total_sum
      FROM top_5_idle
    ),
    andon_data AS (
      SELECT
        t5.month,
        t5.line,
        t5.secondary_cause_dept,
        CAST(t5.idle_sum AS CHAR) AS idle_time,
        CAST(ROUND((t5.idle_sum * 100.0 / tt5.total_sum), 5) AS CHAR) AS idle_porcent
      FROM
        top_5_idle t5
        CROSS JOIN total_top_5 tt5
    )
    SELECT
      month,
      line,
      secondary_cause_dept,
      idle_time,
      idle_porcent,
      CAST(ROUND(
        SUM(CAST(idle_porcent AS DECIMAL(10,5))) OVER (ORDER BY CAST(idle_time AS DECIMAL) DESC),
        5
      ) AS CHAR) AS idle_procent_acc
    FROM
      andon_data
    ORDER BY
      CAST(idle_time AS DECIMAL) DESC,
      month,
      secondary_cause_dept,
      line
  `;

  revalidatePath("/idle/report");
  return result;
};
