import { db } from "@/lib/db";

// Get Department type from database schema
export type Department = string;

export async function getDepartmentEmails(
  departmentName: Department,
  organization?: string
): Promise<string[]> {
  try {
    const emails = await db.email.findMany({
      where: {
        department: departmentName,
        ...(organization && { organization }),
      },
    });

    if (!emails || emails.length === 0) {
      console.warn(
        `No emails found for department: ${departmentName}${organization ? ` and organization: ${organization}` : ""}`
      );
      return [];
    }

    return emails.map((email) => email.email);
  } catch (error) {
    console.error(
      `Error getting emails for department ${departmentName}:`,
      error
    );
    return [];
  }
}

// Função auxiliar para obter todos os departamentos
export async function getAllDepartments() {
  const departments = await db.department.findMany({});

  return departments;
}

// Função para remover um email de um departamento
export async function removeEmailFromDepartment(emailId: string) {
  return await db.email.delete({
    where: {
      id: emailId,
    },
  });
}

// Função para criar um novo departamento
export async function createDepartment(name: string) {
  return await db.department.create({
    data: {
      name,
    },
  });
}

// Função para deletar um departamento
export async function deleteDepartment(departmentId: string) {
  return await db.department.delete({
    where: {
      id: departmentId,
    },
  });
}
