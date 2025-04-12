import { z } from "zod";

export const upsertIdleReportDataSchema = z.object({
  id: z.string().uuid().optional(),
  year_month: z.string().max(7).nullable(),
  date: z.date().nullable(),
  idle_rework_code_4: z.string().max(50).nullable(),
  organization: z.string().max(50).nullable(),
  line: z.string().max(50).nullable(),
  model: z.string().max(50).nullable(),
  contents: z.string().max(3000).nullable(),
  end_date: z.date().nullable(),
  secondary_cause_dept: z.string().max(50).nullable(),
  idle_time: z.number().int().nullable(),
  createdAt: z
    .date()
    .nullable()
    .default(() => new Date()),
  status: z.string().max(2).nullable(),
  action_plan_file_url: z.string().nullable(),
});

export type UpsertIdleReportDataSchema = z.infer<
  typeof upsertIdleReportDataSchema
>;
