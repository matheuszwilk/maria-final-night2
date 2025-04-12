"use server";

import { db } from "@/lib/db";

export interface OrgAndLineDataDto {
  id: string;
  organization: string | null;
  equipment_line: string | null;
}

export const getOrgAndLineData = async (): Promise<OrgAndLineDataDto[]> => {
  const result = await db.unique_org_line.findMany({
    orderBy: {
      organization: "desc",
    },
  });

  return result;
};
