"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export interface AndonAllDataDto {
  title: string;
  weeks: { [key: string]: number };
  week_numbers: string[];
}

export const getAllLineAndonData = async (
  targetYear: string,
  line?: string
): Promise<AndonAllDataDto[]> => {
  const formattedDate = `${targetYear}-01-01`;

  // Generate week numbers for the entire year
  const weekNumbers = await db.$queryRaw<{ week_number: string }[]>`
    SELECT DISTINCT 
      TO_CHAR(
        DATE_TRUNC('week', 
          generate_series(
            ${formattedDate}::date,
            (${formattedDate}::date + interval '1 year - 1 day')::date,
            '1 day'
          )
        ), 
        'WW'
      ) AS week_number
    ORDER BY week_number
  `;

  const weekNumbersArray = weekNumbers.map((w) => w.week_number);

  const lineFilter =
    line && line !== "All" ? Prisma.sql`AND line = ${line}` : Prisma.empty;
  const equipmentLineFilter =
    line && line !== "All"
      ? Prisma.sql`AND equipment_line = ${line}`
      : Prisma.empty;

  const result = await db.$queryRaw<AndonAllDataDto[]>`
    WITH common_filter AS (
      SELECT ${formattedDate}::date AS target_year
    ),
    weekly_manhour AS (
      SELECT
        TO_CHAR(DATE_TRUNC('week', work_date), 'WW') AS week_number,
        SUM(total_working_time) AS total_work_time
      FROM
        manhour, common_filter
      WHERE
        EXTRACT(YEAR FROM work_date) = EXTRACT(YEAR FROM common_filter.target_year)
        ${lineFilter}
      GROUP BY
        TO_CHAR(DATE_TRUNC('week', work_date), 'WW')
    ),
    andon_data AS (
      SELECT
        'Andon' AS title,
        TO_CHAR(DATE_TRUNC('week', "end"::date), 'WW') AS week_number,
        SUM(andon_time) AS andon_time
      FROM
        andon, common_filter
      WHERE
        EXTRACT(YEAR FROM "end"::date) = EXTRACT(YEAR FROM common_filter.target_year)
        ${equipmentLineFilter}
      GROUP BY
        TO_CHAR(DATE_TRUNC('week', "end"::date), 'WW')
    ),
    andon_stop_qty AS (
      SELECT
        'Andon Stop Qty' AS title,
        TO_CHAR(DATE_TRUNC('week', "end"::date), 'WW') AS week_number,
        COUNT(*) AS stop_qty
      FROM
        andon, common_filter
      WHERE
        EXTRACT(YEAR FROM "end"::date) = EXTRACT(YEAR FROM common_filter.target_year)
        ${equipmentLineFilter}
      GROUP BY
        TO_CHAR(DATE_TRUNC('week', "end"::date), 'WW')
    ),
    manhour_data AS (
      SELECT
        'Man Hour' AS title,
        week_number,
        total_work_time
      FROM
        weekly_manhour
    ),
    instant_stop_data AS (
      SELECT
        'Instant Stop Rate' AS title,
        a.week_number,
        CASE WHEN m.total_work_time != 0 THEN (a.andon_time / 60.0 / m.total_work_time) ELSE 0 END AS stop_rate
      FROM andon_data a
      LEFT JOIN manhour_data m ON a.week_number = m.week_number
    ),
    target_data AS (
      SELECT
        'Target' AS title,
        TO_CHAR(week_number, 'FM00') AS week_number,
        0.02 AS target_value
      FROM generate_series(1, 52) AS week_number
    ),
    wot_data AS (
      SELECT
        'Achievement Rate' AS title,
        t.week_number,
        CASE WHEN t.target_value != 0 THEN (t.target_value - COALESCE(i.stop_rate, 0)) / t.target_value ELSE 0 END AS achievement_rate
      FROM target_data t
      LEFT JOIN instant_stop_data i ON t.week_number = i.week_number
    )
    SELECT 
      title, 
      jsonb_object_agg(week_number, COALESCE(value, 0)) AS weeks
    FROM (
      SELECT title, week_number::text, total_work_time AS value FROM manhour_data
      UNION ALL
      SELECT title, week_number::text, andon_time AS value FROM andon_data
      UNION ALL
      SELECT title, week_number::text, stop_qty AS value FROM andon_stop_qty
      UNION ALL
      SELECT title, week_number::text, target_value AS value FROM target_data
      UNION ALL
      SELECT title, week_number::text, stop_rate AS value FROM instant_stop_data
      UNION ALL
      SELECT title, week_number::text, achievement_rate AS value FROM wot_data
    ) combined_data
    GROUP BY title
    ORDER BY 
      CASE 
        WHEN title = 'Man Hour' THEN 1
        WHEN title = 'Andon' THEN 2
        WHEN title = 'Andon Stop Qty' THEN 3
        WHEN title = 'Target' THEN 4
        WHEN title = 'Instant Stop Rate' THEN 5
        WHEN title = 'Achievement Rate' THEN 6
        ELSE 7
      END, 
      title
  `;

  const resultWithWeekNumbers = result.map((item) => ({
    ...item,
    week_numbers: weekNumbersArray,
  }));

  revalidatePath("/");
  return resultWithWeekNumbers;
};
