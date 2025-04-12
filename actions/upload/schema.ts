import { z } from "zod";

// Verificação se estamos no ambiente do navegador
const isClient = typeof window !== "undefined";

// Criamos um tipo customizado para File
const FileSchema = z.custom<File>(
  (value) => {
    return isClient ? value instanceof File : value instanceof Object;
  },
  {
    message: "No file provided",
  },
);

export const formSchema = z.object({
  file: FileSchema.refine((file) => file.size > 0, {
    message: "File cannot be empty",
  }).refine((file) => file.size <= 300 * 1024 * 1024, {
    message: "File size must be less than 300MB",
  }),
});

export type FormSchema = z.infer<typeof formSchema>;

export const formStateSchema = z.object({
  url: z.string().url().optional(),
  errors: z
    .object({
      file: z.string().optional(),
    })
    .optional(),
});

export type FormState = z.infer<typeof formStateSchema>;