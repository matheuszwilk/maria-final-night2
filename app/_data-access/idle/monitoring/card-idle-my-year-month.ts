"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface IdleByYearMonthDataDto {
  title: string;
  previous_year: number;
  current_year: number;
  yoy_change: number;
}

export const getIdleByYearMonthData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<IdleByYearMonthDataDto[]> => {
  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;
  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;

  const result = await db.$queryRaw<IdleByYearMonthDataDto[]>`
    WITH common_filter AS (
      SELECT ${targetMonth} AS target_month
    ),
    years AS (
      SELECT 
        YEAR(STR_TO_DATE((SELECT target_month FROM common_filter), '%Y-%m')) - 1 AS previous_year,
        YEAR(STR_TO_DATE((SELECT target_month FROM common_filter), '%Y-%m')) AS current_year
    ),
    monthly_hours AS (
      SELECT
        YEAR(work_date) AS year,
        SUM(direct_man_hour) AS direct_hours,
        SUM(controllable_idle_man_hour) AS idle_hours,
        CASE 
          WHEN SUM(direct_man_hour) != 0 
          THEN (SUM(controllable_idle_man_hour) / SUM(direct_man_hour)) * 100
          ELSE 0 
        END AS idle_rate,
        SUM(total_working_time) AS total_working_time,
        AVG(CASE WHEN direct_on_operation != 0 THEN direct_on_operation END) AS avg_direct_on_operation
      FROM
        manhour, common_filter, years
      WHERE
        YEAR(work_date) IN (years.previous_year, years.current_year)
        AND DATE_FORMAT(work_date, '%m') = SUBSTRING((SELECT target_month FROM common_filter), 6, 2)
        ${orgFilter}
        ${lineFilter}
      GROUP BY
        YEAR(work_date)
    ),
    year_list AS (
      SELECT previous_year AS year FROM years
      UNION ALL
      SELECT current_year FROM years
    ),
    combined_data AS (
      SELECT
        y.year,
        COALESCE(mh.direct_hours, 0) AS direct_hours,
        COALESCE(mh.idle_hours, 0) AS idle_hours,
        COALESCE(mh.idle_rate, 0) AS idle_rate,
        COALESCE(mh.total_working_time, 0) AS total_working_time,
        COALESCE(mh.avg_direct_on_operation, 0) AS avg_direct_on_operation
      FROM
        year_list y
        LEFT JOIN monthly_hours mh ON y.year = mh.year
    ),
    result_data AS (
      SELECT 
        'Direct Hours' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN direct_hours ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN direct_hours ELSE 0 END) AS current_year
      FROM combined_data

      UNION ALL

      SELECT 
        'Idle Hours' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN idle_hours ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN idle_hours ELSE 0 END) AS current_year
      FROM combined_data

      UNION ALL

      SELECT 
        'Idle Rate' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN idle_rate ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN idle_rate ELSE 0 END) AS current_year
      FROM combined_data

      UNION ALL

      SELECT 
        'Total Working Time' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN total_working_time ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN total_working_time ELSE 0 END) AS current_year
      FROM combined_data

      UNION ALL

      SELECT 
        'Direct on Operation' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN avg_direct_on_operation ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN avg_direct_on_operation ELSE 0 END) AS current_year
      FROM combined_data
    )
    SELECT 
      title,
      previous_year,
      current_year,
      CASE 
        WHEN title = 'Total Working Time' THEN
          CASE 
            WHEN previous_year = 0 THEN 0
            ELSE ((current_year - previous_year) / previous_year) * 100
          END
        ELSE
          CASE 
            WHEN previous_year = 0 THEN 0
            ELSE ((previous_year - current_year) / previous_year) * 100
          END
      END AS yoy_change
    FROM result_data
    ORDER BY 
      CASE 
        WHEN title = 'Direct Hours' THEN 1
        WHEN title = 'Idle Hours' THEN 2
        WHEN title = 'Idle Rate' THEN 3
        WHEN title = 'Total Working Time' THEN 4
        WHEN title = 'Direct on Operation' THEN 5
      END;
  `;

  revalidatePath("/idle/dashboard");
  return result;
};
