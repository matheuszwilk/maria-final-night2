"use server";

import { db } from "@/lib/db";

export interface DepartmentDto {
  primary_cause_dept: string | null;
}

export const getDepartments = async (): Promise<DepartmentDto[]> => {
  const result = await db.idle.findMany({
    distinct: ["primary_cause_dept"],
    select: {
      primary_cause_dept: true,
    },
    orderBy: {
      primary_cause_dept: "asc",
    },
  });

  return result;
};
