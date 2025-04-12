import { z } from "zod";

export const TargetSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project Name is required")
    .max(5, "Project Name must be less than 5 characters"),
  organization: z
    .string()
    .min(1, "Organization is required")
    .max(3, "Organization must be less than 3 characters"),
  line: z
    .string()
    .min(1, "Line is required")
    .max(14, "Line must be less than 14 characters"),
  year: z
    .string()
    .min(1, "Year is required")
    .max(4, "Year must be less than 4 characters"),
  target: z
    .number()
    .min(0, "Target must be greater than or equal to 0")
    .max(1, "Target must be less than or equal to 1")
    .multipleOf(0.000001, "Target must have at most 6 decimal places"),
  createdAt: z.date(),
  updatedAt: z.date(),
});
