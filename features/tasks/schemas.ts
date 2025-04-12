import { $Enums } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum($Enums.Status, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.coerce.date().refine((date) => {
    // Verificar se a data de vencimento não é anterior à data atual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Due date cannot be earlier than today (the requested date)"),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});
