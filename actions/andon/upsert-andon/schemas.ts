import { z } from "zod";

export const upsertAndonReportDataSchema = z.object({
  id: z.string().uuid().optional(),
  year_month: z.string().max(7).nullable().optional(),
  andon_process: z.string().max(50).nullable(),
  equipment_line: z.string().max(50).nullable(),
  reason: z.string().max(200).nullable(),
  end_date: z.string().nullable(),
  cause_department: z.string().max(50).nullable(),
  andon_time: z.number().int().nullable(),
  createdAt: z
    .date()
    .nullable()
    .default(() => new Date()),
  status: z.string().max(2).nullable().default("NG"),
  action_plan_file_url: z.string().nullable(),
});

export type UpsertAndonReportDataSchema = z.infer<
  typeof upsertAndonReportDataSchema
>;
