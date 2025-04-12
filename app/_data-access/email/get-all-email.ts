"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface EmailDataDto {
  id: string;
  email: string;
  organization: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllEmailsToTable = async (): Promise<EmailDataDto[]> => {
  const emails = await db.email.findMany({
    select: {
      id: true,
      email: true,
      organization: true,
      department: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedEmails = emails.map((email) => ({
    id: email.id,
    email: email.email,
    organization: email.organization,
    department: email.department,
    createdAt: email.createdAt,
    updatedAt: email.updatedAt,
  }));

  revalidatePath("/config");
  return formattedEmails;
};
