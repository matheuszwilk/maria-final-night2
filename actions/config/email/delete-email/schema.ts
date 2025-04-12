import { z } from "zod";

export const deleteEmailSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

export type DeleteEmailSchema = z.infer<typeof deleteEmailSchema>;
