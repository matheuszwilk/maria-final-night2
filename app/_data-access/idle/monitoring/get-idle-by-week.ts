"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface IdleByWeekDataDto {
  title: string;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
  week_5: number;
  week_numbers: string[];
}

export const getIdleByWeekData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<IdleByWeekDataDto[]> => {
  const formattedDate = `${targetMonth}-01`;

  const orgCondition = org && org !== "All" ? org : null;
  const lineCondition = line && line !== "All" ? line : null;

  // Get week numbers first
  const weekNumbers = await db.$queryRaw<{ week_number: string }[]>`
    WITH RECURSIVE date_weeks AS (
      SELECT 
          DATE_FORMAT(
              DATE(CONCAT(${targetMonth}, '-01')), 
              '%Y-%m-%d'
          ) as date_value
      FROM dual
      UNION ALL
      SELECT 
          DATE_ADD(date_value, INTERVAL 1 DAY)
      FROM date_weeks
      WHERE DATE_FORMAT(date_value, '%Y-%m') = ${targetMonth}
    )
    SELECT DISTINCT 
        CONCAT('', WEEK(DATE(DATE_FORMAT(date_value, '%Y-%m-%d') - INTERVAL WEEKDAY(date_value) DAY), 1)) as week_number
    FROM date_weeks
    ORDER BY date_value ASC
    LIMIT 5;
  `;

  const weekNumbersArray = weekNumbers.map((w) => w.week_number);

  // Get target values for the year
  const targetResults = await db.$queryRaw<
    { year: string; target_value: number }[]
  >`
    WITH common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization
    )
    SELECT 
      DATE_FORMAT(${formattedDate}, '%Y') as year,
      CASE 
        WHEN (SELECT organization FROM common_filter) IS NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE year = DATE_FORMAT(${formattedDate}, '%Y') AND projectName = 'idle'
        )
        WHEN (SELECT organization FROM common_filter) IS NOT NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE organization = (SELECT organization FROM common_filter)
            AND year = DATE_FORMAT(${formattedDate}, '%Y')
            AND projectName = 'idle'
        )
        ELSE COALESCE(t.target, 0.02)
      END as target_value
    FROM (SELECT 1) dummy
    LEFT JOIN target t ON 
      t.organization = COALESCE((SELECT organization FROM common_filter), t.organization)
      AND t.line = COALESCE((SELECT line FROM common_filter), t.line)
      AND t.year = DATE_FORMAT(${formattedDate}, '%Y')
      AND t.projectName = 'idle'
  `;

  const targetValue = (targetResults[0]?.target_value || 0.02) * 100;

  const result = await db.$queryRaw<IdleByWeekDataDto[]>`
    WITH RECURSIVE common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization,
             ${targetMonth} AS target_month
    ),
    date_weeks AS (
      SELECT 
          DATE_FORMAT(
              DATE(CONCAT((SELECT target_month FROM common_filter), '-01')), 
              '%Y-%m-%d'
          ) as date_value
      FROM common_filter
      UNION ALL
      SELECT 
          DATE_ADD(date_value, INTERVAL 1 DAY)
      FROM date_weeks
      WHERE DATE_FORMAT(date_value, '%Y-%m') = (SELECT target_month FROM common_filter)
    ),
    week_numbers AS (
      SELECT DISTINCT 
          DATE(DATE_FORMAT(date_value, '%Y-%m-%d') - INTERVAL WEEKDAY(date_value) DAY) as week_start
      FROM date_weeks
      ORDER BY week_start ASC
      LIMIT 5
    ),
    weekly_hours AS (
      SELECT
          DATE(DATE_FORMAT(work_date, '%Y-%m-%d') - INTERVAL WEEKDAY(work_date) DAY) AS week_start,
          SUM(direct_man_hour) as direct_hours,
          SUM(controllable_idle_man_hour) as idle_hours,
          CASE 
              WHEN SUM(direct_man_hour) != 0 
              THEN (SUM(controllable_idle_man_hour) / SUM(direct_man_hour)) * 100
              ELSE 0 
          END as idle_to_direct_ratio
      FROM
          manhour m, common_filter
      WHERE
          ${orgCondition ? Prisma.sql`m.organization = ${orgCondition} AND` : Prisma.empty}
          ${lineCondition ? Prisma.sql`m.line = ${lineCondition} AND` : Prisma.empty}
          DATE_FORMAT(work_date, '%Y-%m') = (SELECT target_month FROM common_filter)
      GROUP BY
          DATE(DATE_FORMAT(work_date, '%Y-%m-%d') - INTERVAL WEEKDAY(work_date) DAY)
    ),
    result_data AS (
      SELECT 
          'Direct Man Hour' AS title,
          1 AS sort_order,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 0,1) THEN direct_hours ELSE 0 END) AS week_1,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 1,1) THEN direct_hours ELSE 0 END) AS week_2,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 2,1) THEN direct_hours ELSE 0 END) AS week_3,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 3,1) THEN direct_hours ELSE 0 END) AS week_4,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 4,1) THEN direct_hours ELSE 0 END) AS week_5
      FROM weekly_hours

      UNION ALL

      SELECT 
          'Idle Man Hour' AS title,
          2 AS sort_order,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 0,1) THEN idle_hours ELSE 0 END) AS week_1,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 1,1) THEN idle_hours ELSE 0 END) AS week_2,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 2,1) THEN idle_hours ELSE 0 END) AS week_3,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 3,1) THEN idle_hours ELSE 0 END) AS week_4,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 4,1) THEN idle_hours ELSE 0 END) AS week_5
      FROM weekly_hours

      UNION ALL

      SELECT 
          'Target (%)' AS title,
          3 AS sort_order,
          ${targetValue} AS week_1,
          ${targetValue} AS week_2,
          ${targetValue} AS week_3,
          ${targetValue} AS week_4,
          ${targetValue} AS week_5

      UNION ALL

      SELECT 
          'Idle Rate (%)' AS title,
          4 AS sort_order,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 0,1) THEN idle_to_direct_ratio ELSE 0 END) AS week_1,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 1,1) THEN idle_to_direct_ratio ELSE 0 END) AS week_2,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 2,1) THEN idle_to_direct_ratio ELSE 0 END) AS week_3,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 3,1) THEN idle_to_direct_ratio ELSE 0 END) AS week_4,
          MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 4,1) THEN idle_to_direct_ratio ELSE 0 END) AS week_5
      FROM weekly_hours

      UNION ALL

      SELECT 
          ac.title,
          ac.sort_order,
          CASE WHEN ${targetValue} = 0 THEN 0 ELSE ((${targetValue} - ac.w1) / ${targetValue}) * 100 END AS week_1,
          CASE WHEN ${targetValue} = 0 THEN 0 ELSE ((${targetValue} - ac.w2) / ${targetValue}) * 100 END AS week_2,
          CASE WHEN ${targetValue} = 0 THEN 0 ELSE ((${targetValue} - ac.w3) / ${targetValue}) * 100 END AS week_3,
          CASE WHEN ${targetValue} = 0 THEN 0 ELSE ((${targetValue} - ac.w4) / ${targetValue}) * 100 END AS week_4,
          CASE WHEN ${targetValue} = 0 THEN 0 ELSE ((${targetValue} - ac.w5) / ${targetValue}) * 100 END AS week_5
      FROM (
          SELECT 
              'Achievement Rate (%)' AS title,
              5 AS sort_order,
              MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 0,1) THEN idle_to_direct_ratio ELSE 0 END) AS w1,
              MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 1,1) THEN idle_to_direct_ratio ELSE 0 END) AS w2,
              MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 2,1) THEN idle_to_direct_ratio ELSE 0 END) AS w3,
              MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 3,1) THEN idle_to_direct_ratio ELSE 0 END) AS w4,
              MAX(CASE WHEN week_start = (SELECT week_start FROM week_numbers ORDER BY week_start LIMIT 4,1) THEN idle_to_direct_ratio ELSE 0 END) AS w5
          FROM weekly_hours
      ) ac
    )
    SELECT 
      title,
      week_1,
      week_2,
      week_3,
      week_4,
      week_5
    FROM 
      result_data
    ORDER BY 
      sort_order;
  `;

  const formattedResult = result.map((item) => ({
    ...item,
    week_numbers: weekNumbersArray,
  }));

  revalidatePath("idle/dashboard");
  return formattedResult;
};
