import * as z from "zod";

export const EmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  organization: z.string().min(1, { message: "Organization is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
