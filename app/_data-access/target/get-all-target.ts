"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TargetSchema } from "@/actions/config/target/create-target/schema";

export type TargetDataDto = z.infer<typeof TargetSchema> & {
  id: string;
};

export const getAllTargetstoTable = async (): Promise<TargetDataDto[]> => {
  const targets = await db.target.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  revalidatePath("/config");
  return targets;
};
