"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface AndonByYearDataDto {
  title: string;
  year_1: number;
  year_2: number;
  year_numbers: string[];
}

interface RawAndonData {
  title: string;
  previous_year: number;
  current_year: number;
}

export const getAndonByYearData = async (
  targetYear: string,
  org?: string,
  line?: string
): Promise<AndonByYearDataDto[]> => {
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
          WHERE year = years.year AND projectName = 'andon'
        )
        WHEN (SELECT organization FROM common_filter) IS NOT NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE organization = (SELECT organization FROM common_filter)
            AND year = years.year 
            AND projectName = 'andon'
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
      AND t.projectName = 'andon'
  `;

  const currentYearTarget =
    targetResults.find((t) => t.year === currentYear)?.target_value || 0.02;
  const previousYearTarget =
    targetResults.find((t) => t.year === previousYear)?.target_value || 0.02;

  const result = await db.$queryRaw<RawAndonData[]>`
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
    monthly_manhour AS (
      SELECT
          YEAR(work_date) AS year,
          SUM(total_working_time) AS total_work_time
      FROM
          manhour, common_filter, years
      WHERE
          YEAR(work_date) IN (years.previous_year, years.current_year)
          AND ${orgCondition ? Prisma.sql`manhour.organization = (SELECT organization FROM common_filter)` : Prisma.sql`1=1`}
          AND ${lineCondition ? Prisma.sql`manhour.line = (SELECT line FROM common_filter)` : Prisma.sql`1=1`}
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
          AND ${orgCondition ? Prisma.sql`andon.organization = (SELECT organization FROM common_filter)` : Prisma.sql`1=1`}
          AND ${lineCondition ? Prisma.sql`andon.equipment_line = (SELECT line FROM common_filter)` : Prisma.sql`1=1`}
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
              THEN (COALESCE(a.total_andon_time, 0) / 60.0 / COALESCE(mh.total_work_time, 0))
              ELSE 0 
          END AS instant_stop_rate
      FROM
          year_list y
      LEFT JOIN monthly_manhour mh ON y.year = mh.year
      LEFT JOIN monthly_andon a ON y.year = a.year
    ),
    target_data AS (
      SELECT
          y.year,
          CASE 
              WHEN y.year = years.previous_year THEN ${previousYearTarget}
              ELSE ${currentYearTarget}
          END AS target
      FROM year_list y
      CROSS JOIN years
    ),
    final_data AS (
      SELECT
          cd.year,
          cd.man_hour,
          cd.andon_time,
          cd.andon_stop_qty,
          cd.instant_stop_rate,
          td.target,
          CASE 
              WHEN td.target != 0 THEN (td.target - cd.instant_stop_rate) / td.target
              ELSE 0 
          END AS achievement_rate
      FROM combined_data cd
      JOIN target_data td ON cd.year = td.year
    )
    SELECT 
      title,
      previous_year,
      current_year
    FROM (
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
    ) subquery
    ORDER BY 
      CASE 
          WHEN title = 'Working Time' THEN 1
          WHEN title = 'Andon' THEN 2
          WHEN title = 'Andon Stop Qty' THEN 3
          WHEN title = 'Target' THEN 4
          WHEN title = 'Instant Stop Rate' THEN 5
          WHEN title = 'Achievement Rate' THEN 6
      END
  `;

  const yearNumbers = [(parseInt(currentYear) - 1).toString(), currentYear];

  const formattedResult: AndonByYearDataDto[] = result.map((item) => ({
    title: item.title,
    year_1: Number(item.previous_year) || 0,
    year_2: Number(item.current_year) || 0,
    year_numbers: yearNumbers,
  }));

  revalidatePath("andon/dashboard");
  return formattedResult;
};
