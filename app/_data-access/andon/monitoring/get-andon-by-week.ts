"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export interface AndonByWeekDataDto {
  title: string;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
  week_5: number;
  week_numbers: string[];
}

export const getAndonData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<AndonByWeekDataDto[]> => {
  // Get week numbers for the month
  const weekNumbers = await db.$queryRaw<{ week_number: string }[]>`
    WITH RECURSIVE dates AS (
      SELECT DATE(${targetMonth + "-01"}) AS date
      UNION ALL
      SELECT date + INTERVAL 1 DAY
      FROM dates
      WHERE date < LAST_DAY(${targetMonth + "-01"})
    )
    SELECT DISTINCT
      CAST(WEEKOFYEAR(date) AS CHAR) AS week_number
    FROM dates
    ORDER BY date
    LIMIT 5;
  `;

  const [week1, week2, week3, week4, week5] = weekNumbers.map(
    (w) => w.week_number
  );

  const orgCondition = org && org !== "All" ? org : null;
  const lineCondition = line && line !== "All" ? line : null;

  // Get target values for the year
  const targetResults = await db.$queryRaw<
    { year: string; target_value: number }[]
  >`
    WITH common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization
    )
    SELECT 
      DATE_FORMAT(${targetMonth + "-01"}, '%Y') as year,
      CASE 
        WHEN (SELECT organization FROM common_filter) IS NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE year = DATE_FORMAT(${targetMonth + "-01"}, '%Y') AND projectName = 'andon'
        )
        WHEN (SELECT organization FROM common_filter) IS NOT NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE organization = (SELECT organization FROM common_filter)
            AND year = DATE_FORMAT(${targetMonth + "-01"}, '%Y')
            AND projectName = 'andon'
        )
        ELSE COALESCE(t.target, 0.02)
      END as target_value
    FROM (SELECT 1) dummy
    LEFT JOIN target t ON 
      t.organization = COALESCE((SELECT organization FROM common_filter), t.organization)
      AND t.line = COALESCE((SELECT line FROM common_filter), t.line)
      AND t.year = DATE_FORMAT(${targetMonth + "-01"}, '%Y')
      AND t.projectName = 'andon'
  `;

  const targetValue = targetResults[0]?.target_value || 0.02;

  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;
  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;
  const equipmentLineFilter =
    line && line !== "All"
      ? Prisma.sql`AND equipment_line = ${line}`
      : Prisma.empty;

  const result = await db.$queryRaw<AndonByWeekDataDto[]>`
    WITH weekly_manhour AS (
      SELECT
        CAST(WEEKOFYEAR(work_date) AS CHAR) AS week_number,
        SUM(total_working_time) AS total_work_time
      FROM
        manhour
      WHERE
        DATE_FORMAT(work_date, '%Y-%m') = ${targetMonth}
        ${orgFilter}
        ${lineFilter}
      GROUP BY
        WEEKOFYEAR(work_date)
    ),
    andon_data AS (
      SELECT
        'Andon' AS title,
        SUM(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week1} THEN andon_time ELSE 0 END) AS week_1,
        SUM(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week2} THEN andon_time ELSE 0 END) AS week_2,
        SUM(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week3} THEN andon_time ELSE 0 END) AS week_3,
        SUM(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week4} THEN andon_time ELSE 0 END) AS week_4,
        SUM(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week5} THEN andon_time ELSE 0 END) AS week_5
      FROM
        andon
      WHERE
        DATE_FORMAT(\`end\`, '%Y-%m') = ${targetMonth}
        ${orgFilter}
        ${equipmentLineFilter}
    ),
    andon_stop_qty AS (
      SELECT
        'Andon Stop Qty' AS title,
        COUNT(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week1} THEN 1 END) AS week_1,
        COUNT(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week2} THEN 1 END) AS week_2,
        COUNT(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week3} THEN 1 END) AS week_3,
        COUNT(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week4} THEN 1 END) AS week_4,
        COUNT(CASE WHEN CAST(WEEKOFYEAR(\`end\`) AS CHAR) = ${week5} THEN 1 END) AS week_5
      FROM
        andon
      WHERE
        DATE_FORMAT(\`end\`, '%Y-%m') = ${targetMonth}
        ${orgFilter}
        ${equipmentLineFilter}
    ),
    manhour_data AS (
      SELECT
        'Man Hour' AS title,
        SUM(CASE WHEN week_number = ${week1} THEN total_work_time ELSE 0 END) AS week_1,
        SUM(CASE WHEN week_number = ${week2} THEN total_work_time ELSE 0 END) AS week_2,
        SUM(CASE WHEN week_number = ${week3} THEN total_work_time ELSE 0 END) AS week_3,
        SUM(CASE WHEN week_number = ${week4} THEN total_work_time ELSE 0 END) AS week_4,
        SUM(CASE WHEN week_number = ${week5} THEN total_work_time ELSE 0 END) AS week_5
      FROM
        weekly_manhour
    ),
    instant_stop_data AS (
      SELECT
        'Instant Stop Rate' AS title,
        CASE WHEN m.week_1 != 0 THEN (a.week_1 / 60.0 / m.week_1) ELSE 0 END AS week_1,
        CASE WHEN m.week_2 != 0 THEN (a.week_2 / 60.0 / m.week_2) ELSE 0 END AS week_2,
        CASE WHEN m.week_3 != 0 THEN (a.week_3 / 60.0 / m.week_3) ELSE 0 END AS week_3,
        CASE WHEN m.week_4 != 0 THEN (a.week_4 / 60.0 / m.week_4) ELSE 0 END AS week_4,
        CASE WHEN m.week_5 != 0 THEN (a.week_5 / 60.0 / m.week_5) ELSE 0 END AS week_5
      FROM andon_data a
      CROSS JOIN manhour_data m
    ),
    target_data AS (
      SELECT
        'Target' AS title,
        ${targetValue} AS week_1,
        ${targetValue} AS week_2,
        ${targetValue} AS week_3,
        ${targetValue} AS week_4,
        ${targetValue} AS week_5
    ),
    achievement_data AS (
      SELECT
        'Achievement Rate' AS title,
        CASE WHEN t.week_1 != 0 THEN (t.week_1 - i.week_1) / t.week_1 ELSE 0 END AS week_1,
        CASE WHEN t.week_2 != 0 THEN (t.week_2 - i.week_2) / t.week_2 ELSE 0 END AS week_2,
        CASE WHEN t.week_3 != 0 THEN (t.week_3 - i.week_3) / t.week_3 ELSE 0 END AS week_3,
        CASE WHEN t.week_4 != 0 THEN (t.week_4 - i.week_4) / t.week_4 ELSE 0 END AS week_4,
        CASE WHEN t.week_5 != 0 THEN (t.week_5 - i.week_5) / t.week_5 ELSE 0 END AS week_5
      FROM target_data t
      CROSS JOIN instant_stop_data i
    )
    SELECT title, week_1, week_2, week_3, week_4, week_5
    FROM (
      SELECT *, 1 AS sort_order FROM manhour_data
      UNION ALL
      SELECT *, 2 AS sort_order FROM andon_data
      UNION ALL
      SELECT *, 3 AS sort_order FROM andon_stop_qty
      UNION ALL
      SELECT *, 4 AS sort_order FROM target_data
      UNION ALL
      SELECT *, 5 AS sort_order FROM instant_stop_data
      UNION ALL
      SELECT *, 6 AS sort_order FROM achievement_data
    ) combined_data
    ORDER BY sort_order, title;
  `;

  const resultWithWeekNumbers = result.map((item) => ({
    ...item,
    week_numbers: [week1, week2, week3, week4, week5].filter(Boolean),
  }));

  revalidatePath("andon/dashboard");
  return resultWithWeekNumbers;
};
