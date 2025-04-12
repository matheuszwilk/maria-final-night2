"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EmailSchema } from "./schema";
import { z } from "zod";

export const createEmailAction = async (
  values: z.infer<typeof EmailSchema>
) => {
  try {
    const validatedFields = EmailSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields! Please check your input." };
    }

    // Verificar se já existe um email com o mesmo departamento e organização
    const existingEmail = await db.email.findFirst({
      where: {
        AND: [
          { organization: values.organization },
          { department: values.department },
          { email: values.email },
        ],
      },
    });

    if (existingEmail) {
      return {
        error:
          "This email already exists for this organization and department!",
      };
    }

    // Criar novo email com timestamps
    const newEmail = await db.email.create({
      data: {
        email: values.email,
        organization: values.organization,
        department: values.department,
        createdAt: values.createdAt || new Date(),
        updatedAt: values.updatedAt || new Date(),
      },
    });

    revalidatePath("/config");
    return {
      success: "Email added successfully!",
      email: newEmail,
    };
  } catch (error) {
    console.error("Error creating email:", error);
    return { error: "Failed to create email. Please try again." };
  }
};
