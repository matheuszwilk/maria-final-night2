import { z } from "zod";

export const deleteTargetSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

export type DeleteTargetSchema = z.infer<typeof deleteTargetSchema>;
