"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface IdleByYearDataDto {
  title: string;
  year_1: number;
  year_2: number;
  year_numbers: string[];
}

interface RawIdleData {
  title: string;
  previous_year: number;
  current_year: number;
}

export const getIdleByYearData = async (
  targetYear: string,
  org?: string,
  line?: string
): Promise<IdleByYearDataDto[]> => {
  const orgCondition = org && org !== "All" ? org : null;
  const lineCondition = line && line !== "All" ? line : null;
  const currentYear = targetYear.substring(0, 4);
  const previousYear = (parseInt(currentYear) - 1).toString();

  // Get target values for both years
  const targetResults = await db.$queryRaw<
    { year: string; target_value: number }[]
  >`
    WITH common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization
    )
    SELECT 
      t.year,
      CASE 
        WHEN (SELECT organization FROM common_filter) IS NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE year = years.year AND projectName = 'idle'
        )
        WHEN (SELECT organization FROM common_filter) IS NOT NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE organization = (SELECT organization FROM common_filter)
            AND year = years.year 
            AND projectName = 'idle'
        )
        ELSE COALESCE(t.target, 0.02)
      END as target_value
    FROM (
      SELECT ${currentYear} as year
      UNION ALL 
      SELECT ${previousYear} as year
    ) years
    LEFT JOIN target t ON 
      t.organization = COALESCE((SELECT organization FROM common_filter), t.organization)
      AND t.line = COALESCE((SELECT line FROM common_filter), t.line)
      AND t.year = years.year
      AND t.projectName = 'idle'
  `;

  const currentYearTarget =
    targetResults.find((t) => t.year === currentYear)?.target_value || 0.02;
  const previousYearTarget =
    targetResults.find((t) => t.year === previousYear)?.target_value || 0.02;

  const result = await db.$queryRaw<RawIdleData[]>`
    WITH RECURSIVE common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization,
             ${targetYear} AS target_year
    ),
    years AS (
      SELECT 
          (SELECT target_year FROM common_filter) - 1 AS previous_year,
          (SELECT target_year FROM common_filter) AS current_year
    ),
    yearly_hours AS (
      SELECT
          YEAR(work_date) AS year,
          SUM(direct_man_hour) as direct_hours,
          SUM(controllable_idle_man_hour) as idle_hours,
          CASE 
              WHEN SUM(direct_man_hour) != 0 
              THEN (SUM(controllable_idle_man_hour) / SUM(direct_man_hour)) * 100
              ELSE 0 
          END as idle_to_direct_ratio
      FROM
          manhour
          CROSS JOIN common_filter
          CROSS JOIN years
      WHERE
          YEAR(work_date) IN (years.previous_year, years.current_year)
          AND ${orgCondition ? Prisma.sql`manhour.organization = (SELECT organization FROM common_filter)` : Prisma.sql`1=1`}
          AND ${lineCondition ? Prisma.sql`manhour.line = (SELECT line FROM common_filter)` : Prisma.sql`1=1`}
      GROUP BY
          YEAR(work_date)
    ),
    target_values AS (
      SELECT 
        ${previousYearTarget * 100} as previous_year_target,
        ${currentYearTarget * 100} as current_year_target
    ),
    result_data AS (
      SELECT 
          'Direct Man Hour' AS title,
          MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN direct_hours ELSE 0 END) AS previous_year,
          MAX(CASE WHEN year = (SELECT current_year FROM years) THEN direct_hours ELSE 0 END) AS current_year
      FROM yearly_hours

      UNION ALL

      SELECT 
          'Idle Man Hour' AS title,
          MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN idle_hours ELSE 0 END) AS previous_year,
          MAX(CASE WHEN year = (SELECT current_year FROM years) THEN idle_hours ELSE 0 END) AS current_year
      FROM yearly_hours

      UNION ALL

      SELECT 
          'Target (%)' AS title,
          previous_year_target AS previous_year,
          current_year_target AS current_year
      FROM target_values

      UNION ALL

      SELECT 
          'Idle Rate (%)' AS title,
          MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN idle_to_direct_ratio ELSE 0 END) AS previous_year,
          MAX(CASE WHEN year = (SELECT current_year FROM years) THEN idle_to_direct_ratio ELSE 0 END) AS current_year
      FROM yearly_hours

      UNION ALL

      SELECT 
          ac.title,
          CASE 
            WHEN t.previous_year_target = 0 THEN 0 
            ELSE ((t.previous_year_target - ac.prev_rate) / t.previous_year_target) * 100 
          END AS previous_year,
          CASE 
            WHEN t.current_year_target = 0 THEN 0 
            ELSE ((t.current_year_target - ac.curr_rate) / t.current_year_target) * 100 
          END AS current_year
      FROM (
          SELECT 
              'Achievement Rate (%)' AS title,
              MAX(CASE WHEN year = (SELECT previous_year FROM years) THEN idle_to_direct_ratio ELSE 0 END) AS prev_rate,
              MAX(CASE WHEN year = (SELECT current_year FROM years) THEN idle_to_direct_ratio ELSE 0 END) AS curr_rate
          FROM yearly_hours
      ) ac
      CROSS JOIN target_values t
    )
    SELECT 
      title,
      previous_year,
      current_year
    FROM 
      result_data
    ORDER BY 
      CASE title
        WHEN 'Direct Man Hour' THEN 1
        WHEN 'Idle Man Hour' THEN 2
        WHEN 'Target (%)' THEN 3
        WHEN 'Idle Rate (%)' THEN 4
        WHEN 'Achievement Rate (%)' THEN 5
      END
  `;

  const yearNumbers = [(parseInt(currentYear) - 1).toString(), currentYear];

  const formattedResult: IdleByYearDataDto[] = result.map((item) => ({
    title: item.title,
    year_1: Number(item.previous_year) || 0,
    year_2: Number(item.current_year) || 0,
    year_numbers: yearNumbers,
  }));

  revalidatePath("idle/dashboard");
  return formattedResult;
};
