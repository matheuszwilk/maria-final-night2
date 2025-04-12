"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface AndonByYearMonthDataDto {
  title: string;
  previous_year: number;
  current_year: number;
  yoy_change: number;
}

const TARGET_RATE = 0.02;

export const getAndonByYearMonthData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<AndonByYearMonthDataDto[]> => {
  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;
  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;
  const equipmentLineFilter =
    line && line !== "All"
      ? Prisma.sql`AND equipment_line = ${line}`
      : Prisma.empty;

  const result = await db.$queryRaw<AndonByYearMonthDataDto[]>`
    WITH common_filter AS (
      SELECT ${targetMonth} AS target_month
    ),
    years AS (
      SELECT 
        YEAR(STR_TO_DATE((SELECT target_month FROM common_filter), '%Y-%m')) - 1 AS previous_year,
        YEAR(STR_TO_DATE((SELECT target_month FROM common_filter), '%Y-%m')) AS current_year
    ),
    monthly_manhour AS (
      SELECT
        YEAR(work_date) AS year,
        SUM(total_working_time) AS total_work_time
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
    monthly_andon AS (
      SELECT
        YEAR(end) AS year,
        SUM(andon_time) AS total_andon_time,
        COUNT(*) AS andon_stop_qty
      FROM
        andon, common_filter, years
      WHERE
        YEAR(end) IN (years.previous_year, years.current_year)
        AND DATE_FORMAT(end, '%m') = SUBSTRING((SELECT target_month FROM common_filter), 6, 2)
        ${orgFilter}
        ${equipmentLineFilter}
      GROUP BY
        YEAR(end)
    ),
    year_list AS (
      SELECT previous_year AS year FROM years
      UNION ALL
      SELECT current_year FROM years
    ),
    combined_data AS (
      SELECT
        y.year,
        COALESCE(mh.total_work_time, 0) AS man_hour,
        COALESCE(a.total_andon_time, 0) AS andon_time,
        COALESCE(a.andon_stop_qty, 0) AS andon_stop_qty,
        CASE 
          WHEN COALESCE(mh.total_work_time, 0) != 0 
          THEN (COALESCE(a.total_andon_time, 0) / 60.0 / COALESCE(mh.total_work_time, 0)) * 100
          ELSE 0 
        END AS instant_stop_rate
      FROM
        year_list y
      LEFT JOIN monthly_manhour mh ON y.year = mh.year
      LEFT JOIN monthly_andon a ON y.year = a.year
    ),
    final_data AS (
      SELECT
        cd.year,
        cd.man_hour,
        cd.andon_time,
        cd.andon_stop_qty,
        cd.instant_stop_rate,
        ${TARGET_RATE} * 100 AS target,
        CASE 
          WHEN ${TARGET_RATE} * 100 != 0 THEN (${TARGET_RATE} * 100 - cd.instant_stop_rate) / (${TARGET_RATE} * 100)
          ELSE 0 
        END AS achievement_rate
      FROM combined_data cd
    ),
    result_data AS (
      SELECT 
        'Working Time' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN man_hour ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN man_hour ELSE 0 END) AS current_year
      FROM final_data

      UNION ALL

      SELECT 
        'Andon' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN andon_time ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN andon_time ELSE 0 END) AS current_year
      FROM final_data

      UNION ALL

      SELECT 
        'Andon Stop Qty' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN andon_stop_qty ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN andon_stop_qty ELSE 0 END) AS current_year
      FROM final_data

      UNION ALL

      SELECT 
        'Target' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN target ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN target ELSE 0 END) AS current_year
      FROM final_data

      UNION ALL

      SELECT 
        'Instant Stop Rate' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN instant_stop_rate ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN instant_stop_rate ELSE 0 END) AS current_year
      FROM final_data

      UNION ALL

      SELECT 
        'Achievement Rate' AS title,
        MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN achievement_rate ELSE 0 END) AS previous_year,
        MAX(CASE WHEN year = (SELECT current_year FROM years) THEN achievement_rate ELSE 0 END) AS current_year
      FROM final_data
    )
    SELECT 
      title,
      previous_year,
      current_year,
      CASE 
        WHEN previous_year = 0 THEN 0
        ELSE (previous_year - current_year) / previous_year * 100
      END AS yoy_change
    FROM result_data
    ORDER BY 
      CASE 
        WHEN title = 'Working Time' THEN 1
        WHEN title = 'Andon' THEN 2
        WHEN title = 'Andon Stop Qty' THEN 3
        WHEN title = 'Target' THEN 4
        WHEN title = 'Instant Stop Rate' THEN 5
        WHEN title = 'Achievement Rate' THEN 6
      END;
  `;

  revalidatePath("/andon/dashboard");
  return result;
};
