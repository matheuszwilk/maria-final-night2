"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface AndonByMonthDataDto {
  title: string;
  month_1: number;
  month_2: number;
  month_3: number;
  month_4: number;
  month_5: number;
  month_6: number;
  month_numbers: string[];
}

export const getAndonByMonthData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<AndonByMonthDataDto[]> => {
  const formattedDate = `${targetMonth}-01`;

  // Generate the last 6 months of the year-month selected
  const monthNumbers = await db.$queryRaw<{ month_number: string }[]>`
    WITH RECURSIVE months AS (
      SELECT DATE_SUB(DATE_FORMAT(${formattedDate}, '%Y-%m-%d'), INTERVAL 5 MONTH) AS month
      UNION ALL
      SELECT DATE_ADD(month, INTERVAL 1 MONTH)
      FROM months
      WHERE month < DATE_FORMAT(${formattedDate}, '%Y-%m-%d')
    )
    SELECT DATE_FORMAT(month, '%Y-%m') as month_number 
    FROM months
    ORDER BY month;
  `;

  const monthNumbersArray = monthNumbers.map((m) => m.month_number);

  const orgCondition = org && org !== "All" ? org : null;
  const lineCondition = line && line !== "All" ? line : null;

  // Get target values for all months
  const targetResults = await db.$queryRaw<
    { month: string; target_value: number }[]
  >`
    WITH common_filter AS (
      SELECT ${lineCondition} AS line,
             ${orgCondition} AS organization
    ),
    months AS (
      SELECT DATE_FORMAT(month, '%Y') as year
      FROM (
        SELECT DATE_SUB(DATE_FORMAT(${formattedDate}, '%Y-%m-%d'), INTERVAL n MONTH) as month
        FROM (
          SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 
          UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
        ) numbers
      ) dates
    )
    SELECT 
      m.year as month,
      CASE
        WHEN (SELECT organization FROM common_filter) IS NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE year = m.year AND projectName = 'andon'
        )
        WHEN (SELECT organization FROM common_filter) IS NOT NULL 
          AND (SELECT line FROM common_filter) IS NULL THEN (
          SELECT AVG(target)
          FROM target 
          WHERE year = m.year 
          AND organization = (SELECT organization FROM common_filter)
          AND projectName = 'andon'
        )
        ELSE COALESCE(t.target, 0.02)
      END as target_value
    FROM months m
    LEFT JOIN target t ON 
      t.organization = COALESCE((SELECT organization FROM common_filter), t.organization)
      AND t.line = COALESCE((SELECT line FROM common_filter), t.line)
      AND t.year = m.year
      AND t.projectName = 'andon'
  `;

  const monthlyTargets = monthNumbersArray.map((month) => {
    const year = month.substring(0, 4);
    return (
      (targetResults.find((t) => t.month === year)?.target_value || 0.02) * 100
    );
  });

  const result = await db.$queryRaw<AndonByMonthDataDto[]>`
    WITH RECURSIVE months AS (
      SELECT DATE_SUB(DATE_FORMAT(${formattedDate}, '%Y-%m-%d'), INTERVAL 5 MONTH) AS month
      UNION ALL
      SELECT DATE_ADD(month, INTERVAL 1 MONTH)
      FROM months
      WHERE month < DATE_FORMAT(${formattedDate}, '%Y-%m-%d')
    ),
    monthly_manhour AS (
      SELECT
          DATE_FORMAT(work_date, '%Y-%m-01') AS month,
          SUM(total_working_time) AS total_work_time
      FROM
          manhour
      WHERE
          ${orgCondition ? Prisma.sql`organization = ${orgCondition} AND` : Prisma.empty}
          ${lineCondition ? Prisma.sql`line = ${lineCondition} AND` : Prisma.empty}
          work_date >= (SELECT MIN(month) FROM months)
          AND work_date < DATE_ADD((SELECT MAX(month) FROM months), INTERVAL 1 MONTH)
      GROUP BY
          DATE_FORMAT(work_date, '%Y-%m-01')
    ),
    monthly_andon AS (
      SELECT
          DATE_FORMAT(\`end\`, '%Y-%m-01') AS month,
          SUM(andon_time) AS total_andon_time,
          COUNT(*) AS andon_stop_qty
      FROM
          andon
      WHERE
          ${orgCondition ? Prisma.sql`organization = ${orgCondition} AND` : Prisma.empty}
          ${lineCondition ? Prisma.sql`equipment_line = ${lineCondition} AND` : Prisma.empty}
          \`end\` >= (SELECT MIN(month) FROM months)
          AND \`end\` < DATE_ADD((SELECT MAX(month) FROM months), INTERVAL 1 MONTH)
      GROUP BY
          DATE_FORMAT(\`end\`, '%Y-%m-01')
    ),
    combined_data AS (
      SELECT
          m.month,
          COALESCE(ma.total_work_time, 0) AS man_hour,
          COALESCE(a.total_andon_time, 0) AS andon_time,
          COALESCE(a.andon_stop_qty, 0) AS andon_stop_qty,
          CASE 
              WHEN COALESCE(ma.total_work_time, 0) != 0 
              THEN (COALESCE(a.total_andon_time, 0) / 60.0 / COALESCE(ma.total_work_time, 0))
              ELSE 0 
          END AS instant_stop_rate
      FROM
          months m
      LEFT JOIN monthly_manhour ma ON m.month = ma.month
      LEFT JOIN monthly_andon a ON m.month = a.month
    ),
    target_values AS (
      SELECT 
        ${monthlyTargets[0]} as target_1,
        ${monthlyTargets[1]} as target_2,
        ${monthlyTargets[2]} as target_3,
        ${monthlyTargets[3]} as target_4,
        ${monthlyTargets[4]} as target_5,
        ${monthlyTargets[5]} as target_6
    ),
    result_data AS (
      SELECT 
          'Man Hour' AS title,
          1 AS sort_order,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 5 MONTH) THEN man_hour ELSE 0 END) AS month_1,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 4 MONTH) THEN man_hour ELSE 0 END) AS month_2,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 3 MONTH) THEN man_hour ELSE 0 END) AS month_3,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 2 MONTH) THEN man_hour ELSE 0 END) AS month_4,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 1 MONTH) THEN man_hour ELSE 0 END) AS month_5,
          MAX(CASE WHEN month = (SELECT MAX(month) FROM months) THEN man_hour ELSE 0 END) AS month_6
      FROM combined_data

      UNION ALL

      SELECT 
          'Andon' AS title,
          2 AS sort_order,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 5 MONTH) THEN andon_time ELSE 0 END) AS month_1,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 4 MONTH) THEN andon_time ELSE 0 END) AS month_2,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 3 MONTH) THEN andon_time ELSE 0 END) AS month_3,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 2 MONTH) THEN andon_time ELSE 0 END) AS month_4,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 1 MONTH) THEN andon_time ELSE 0 END) AS month_5,
          MAX(CASE WHEN month = (SELECT MAX(month) FROM months) THEN andon_time ELSE 0 END) AS month_6
      FROM combined_data

      UNION ALL

      SELECT 
          'Andon Stop Qty' AS title,
          3 AS sort_order,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 5 MONTH) THEN andon_stop_qty ELSE 0 END) AS month_1,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 4 MONTH) THEN andon_stop_qty ELSE 0 END) AS month_2,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 3 MONTH) THEN andon_stop_qty ELSE 0 END) AS month_3,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 2 MONTH) THEN andon_stop_qty ELSE 0 END) AS month_4,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 1 MONTH) THEN andon_stop_qty ELSE 0 END) AS month_5,
          MAX(CASE WHEN month = (SELECT MAX(month) FROM months) THEN andon_stop_qty ELSE 0 END) AS month_6
      FROM combined_data

      UNION ALL

      SELECT 
          'Target (%)' AS title,
          4 AS sort_order,
          target_1 AS month_1,
          target_2 AS month_2,
          target_3 AS month_3,
          target_4 AS month_4,
          target_5 AS month_5,
          target_6 AS month_6
      FROM target_values

      UNION ALL

      SELECT 
          'Instant Stop Rate' AS title,
          5 AS sort_order,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 5 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS month_1,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 4 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS month_2,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 3 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS month_3,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 2 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS month_4,
          MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 1 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS month_5,
          MAX(CASE WHEN month = (SELECT MAX(month) FROM months) THEN instant_stop_rate * 100 ELSE 0 END) AS month_6
      FROM combined_data

      UNION ALL

      SELECT 
          ac.title,
          ac.sort_order,
          CASE WHEN t.target_1 = 0 THEN 0 ELSE ((t.target_1 - ac.m1) / t.target_1) * 100 END AS month_1,
          CASE WHEN t.target_2 = 0 THEN 0 ELSE ((t.target_2 - ac.m2) / t.target_2) * 100 END AS month_2,
          CASE WHEN t.target_3 = 0 THEN 0 ELSE ((t.target_3 - ac.m3) / t.target_3) * 100 END AS month_3,
          CASE WHEN t.target_4 = 0 THEN 0 ELSE ((t.target_4 - ac.m4) / t.target_4) * 100 END AS month_4,
          CASE WHEN t.target_5 = 0 THEN 0 ELSE ((t.target_5 - ac.m5) / t.target_5) * 100 END AS month_5,
          CASE WHEN t.target_6 = 0 THEN 0 ELSE ((t.target_6 - ac.m6) / t.target_6) * 100 END AS month_6
      FROM (
          SELECT 
              'Achievement Rate (%)' AS title,
              6 AS sort_order,
              MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 5 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS m1,
              MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 4 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS m2,
              MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 3 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS m3,
              MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 2 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS m4,
              MAX(CASE WHEN month = DATE_SUB((SELECT MAX(month) FROM months), INTERVAL 1 MONTH) THEN instant_stop_rate * 100 ELSE 0 END) AS m5,
              MAX(CASE WHEN month = (SELECT MAX(month) FROM months) THEN instant_stop_rate * 100 ELSE 0 END) AS m6
          FROM combined_data
      ) ac
      CROSS JOIN target_values t
    )
    SELECT 
      title,
      month_1,
      month_2,
      month_3,
      month_4,
      month_5,
      month_6
    FROM 
      result_data
    ORDER BY 
      sort_order;
  `;

  const formattedResult = result.map((item) => ({
    ...item,
    month_numbers: monthNumbersArray,
  }));

  revalidatePath("andon/dashboard");
  return formattedResult;
};
