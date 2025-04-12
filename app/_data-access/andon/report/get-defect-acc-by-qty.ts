"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface DefectQtyAccDataDto {
  month: string;
  equipment_line: string;
  andon_process: string;
  total_andon_count: number;
  andon_porcent: string; // Changed to string to avoid Decimal issues
  andon_procent_acc: string; // Changed to string to avoid Decimal issues
}

export const getDefectQtyAccData = async (
  targetMonth: string,
  org?: string,
  line?: string
): Promise<DefectQtyAccDataDto[]> => {
  const orgFilter =
    org && org !== "All" ? Prisma.sql`AND organization = ${org}` : Prisma.empty;

  const lineFilter =
    line && line !== "All"
      ? Prisma.sql`AND equipment_line = ${line}`
      : Prisma.empty;

  const result = await db.$queryRaw<DefectQtyAccDataDto[]>`
    WITH top_andon AS (
      SELECT
        DATE_FORMAT(end, '%Y-%m') AS month,
        equipment_line,
        andon_process,
        COUNT(*) AS total_andon_count
      FROM andon
      WHERE DATE_FORMAT(end, '%Y-%m') = ${targetMonth}
      ${orgFilter}
      ${lineFilter}
      GROUP BY
        DATE_FORMAT(end, '%Y-%m'),
        equipment_line,
        andon_process
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ),
    total_count AS (
      SELECT SUM(total_andon_count) as total
      FROM top_andon
    ),
    andon_data AS (
      SELECT
        month,
        equipment_line,
        andon_process,
        CAST(total_andon_count AS SIGNED) AS total_andon_count,
        CAST(ROUND(CAST((total_andon_count * 100.0 / total) AS DECIMAL(10,6)), 6) AS CHAR) AS andon_porcent
      FROM
        top_andon, total_count
    )
    SELECT
      month,
      equipment_line,
      andon_process,
      total_andon_count,
      andon_porcent,
      CAST(LEAST(100, ROUND(
        (
          SELECT SUM(CAST(ad2.andon_porcent AS DECIMAL(10,6)))
          FROM andon_data ad2
          WHERE ad2.total_andon_count >= ad1.total_andon_count
        ), 6
      )) AS CHAR) AS andon_procent_acc
    FROM
      andon_data ad1
    ORDER BY
      total_andon_count DESC,
      month,
      andon_process,
      equipment_line
  `;

  revalidatePath("/andon/report");
  return result;
};
