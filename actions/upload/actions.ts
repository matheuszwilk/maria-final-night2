"use server";

import { storageProvider } from "@/app/_services/storage";
import { formSchema, formStateSchema, type FormState } from "./schema";
import { ZodError } from "zod";

export async function submitFormAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const file = formData.get("file") as File;

    const validatedFields = formSchema.parse({
      file,
    });

    const url = await storageProvider.upload(validatedFields.file);

    return formStateSchema.parse({ url });
  } catch (error) {
    if (error instanceof ZodError) {
      return formStateSchema.parse({
        errors: {
          file: error.errors[0].message,
        },
      });
    }

    return formStateSchema.parse({
      errors: {
        file: "Something went wrong while uploading the file",
      },
    });
  }
}