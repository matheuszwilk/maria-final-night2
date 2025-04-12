"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface DepartmentDataDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllDepartmentstoTable = async (): Promise<
  DepartmentDataDto[]
> => {
  const departments = await db.department.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  revalidatePath("/config");
  return departments;
};
