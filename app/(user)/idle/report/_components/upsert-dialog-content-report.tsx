"use client";

import { upsertIdleReport } from "@/actions/idle/upsert-idle-report";
import {
  upsertIdleReportDataSchema,
  UpsertIdleReportDataSchema,
} from "@/actions/idle/upsert-idle-report/schemas";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CloudUpload, Paperclip, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Dispatch, SetStateAction, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { submitFormAction } from "@/actions/upload/actions";
import { formSchema, formStateSchema } from "@/actions/upload/schema";
import { UserRole } from "@prisma/client";
import { useCurrentUser } from "@/hooks/use-current-user";

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "text/csv": [".csv"],
} as const;

interface UpsertReportDialogContentProps {
  defaultValues?: UpsertIdleReportDataSchema;
  setDialogIsOpen: Dispatch<SetStateAction<boolean>>;
}

const UpsertReportDialogContent = ({
  defaultValues,
  setDialogIsOpen,
}: UpsertReportDialogContentProps) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = useCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { toast } = useToast();

  const { execute: executeUpsertReport } = useAction(upsertIdleReport, {
    onSuccess: () => {
      toast({
        description: "Relatório atualizado com sucesso ✓",
      });
      setDialogIsOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Ocorreu um erro ao salvar o relatório: ${error}`,
      });
    },
  });

  const form = useForm<UpsertIdleReportDataSchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertIdleReportDataSchema),
    defaultValues: {
      id: defaultValues?.id ?? "",
      year_month: defaultValues?.year_month ?? null,
      date: defaultValues?.date ?? null,
      idle_rework_code_4: defaultValues?.idle_rework_code_4 ?? null,
      organization: defaultValues?.organization ?? null,
      line: defaultValues?.line ?? null,
      model: defaultValues?.model ?? null,
      contents: defaultValues?.contents ?? null,
      end_date: defaultValues?.end_date ?? null,
      secondary_cause_dept: defaultValues?.secondary_cause_dept ?? null,
      idle_time: defaultValues?.idle_time ?? null,
      createdAt: defaultValues?.createdAt ?? null,
      status: defaultValues?.status ?? null,
      action_plan_file_url: defaultValues?.action_plan_file_url ?? null,
    },
  });

  const handleFileUpload = useCallback(async () => {
    if (!files?.[0]) {
      toast({
        variant: "destructive",
        description: "Nenhum arquivo selecionado",
      });
      return null;
    }

    const validationResult = formSchema.safeParse({ file: files[0] });

    if (!validationResult.success) {
      toast({
        variant: "destructive",
        description: validationResult.error.errors[0].message,
      });
      return null;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      const timestamp = new Date().toISOString().slice(0, 10);
      const formattedName = files[0].name.replace(/\s+/g, "-");
      const renamedFile = new File(
        [files[0]],
        `${timestamp}-${formattedName}`,
        {
          type: files[0].type,
        }
      );
      formData.append("file", renamedFile);

      const result = await submitFormAction(
        {
          url: "",
          errors: undefined,
        },
        formData
      );

      const parsedResult = formStateSchema.safeParse(result);

      if (!parsedResult.success) {
        throw new Error("Formato de resposta inválido");
      }

      if (parsedResult.data.errors) {
        throw new Error(parsedResult.data.errors.file);
      }

      if (parsedResult.data.url) {
        toast({
          description: "Arquivo enviado com sucesso!",
        });
        return parsedResult.data.url;
      }

      return null;
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Falha ao enviar arquivo",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [files, toast]);

  const onSubmit = async (data: UpsertIdleReportDataSchema) => {
    try {
      const fileUrl = files
        ? await handleFileUpload()
        : data.action_plan_file_url;

      if (files && !fileUrl) return;

      executeUpsertReport({
        ...data,
        id: defaultValues?.id,
        action_plan_file_url: fileUrl || null,
      });
    } catch (_error) {
      toast({
        variant: "destructive",
        description: "Ocorreu um erro ao salvar o relatório",
      });
    }
  };

  const renderFormField = (
    name: keyof UpsertIdleReportDataSchema,
    label: string,
    hidden = false,
    type = "text"
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={hidden ? "hidden" : undefined}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={`Digite ${label.toLowerCase()}`}
              {...field}
              disabled={!isAdmin}
              value={
                type === "datetime-local" && field.value
                  ? new Date(field.value as string).toISOString().slice(0, 16)
                  : (field.value?.toString() ?? "")
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <DialogContent className="sm:max-w-[600px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-center">
              Idle Report
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              Input your action plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 text-sm">
            {renderFormField("year_month", "Month/Year", true)}
            {renderFormField("date", "Date", true, "date")}
            {renderFormField("idle_rework_code_4", "Idle Rework Code")}
            {renderFormField("organization", "Organization", true)}
            {renderFormField("line", "Line", true)}
            {renderFormField("model", "Model", true)}
            {renderFormField("contents", "Contents")}
            {renderFormField("end_date", "End Date", true, "datetime-local")}
            {renderFormField(
              "secondary_cause_dept",
              "Secondary Cause Department"
            )}
            {renderFormField("idle_time", "Idle Time", true, "number")}
            {renderFormField("status", "Status", true)}

            <FormField
              control={form.control}
              name="action_plan_file_url"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-medium">
                    Select the file to upload *
                  </FormLabel>
                  <FormControl>
                    <FileUploader
                      value={files}
                      onValueChange={(newFiles) => {
                        setFiles(newFiles);
                        if (newFiles?.[0]) field.onChange(null);
                      }}
                      dropzoneOptions={{
                        maxSize: MAX_FILE_SIZE,
                        accept: ACCEPTED_FILE_TYPES,
                      }}
                      className="relative bg-background/50 rounded-lg p-2 transition-colors hover:bg-background/80"
                    >
                      <FileInput
                        id="fileInput"
                        className="outline-dashed outline-1 outline-border hover:outline-primary/50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-center flex-col p-8 w-full gap-2">
                          <CloudUpload className="text-muted-foreground w-12 h-12 transition-transform group-hover:scale-110" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Clique para enviar
                            </span>
                            &nbsp;ou arraste e solte
                          </p>
                          <p className="text-xs text-muted-foreground/80">
                            Arquivo deve ser menor que 300MB
                          </p>
                        </div>
                      </FileInput>
                      <FileUploaderContent>
                        {files?.map((file, i) => (
                          <FileUploaderItem
                            key={i}
                            index={i}
                            className="bg-background/50 p-2 rounded-md border border-border"
                          >
                            <Paperclip className="h-4 w-4 stroke-current flex-shrink-0" />
                            <span className="truncate max-w-[calc(100%-2rem)] mr-2 text-sm">
                              {file.name.length > 30
                                ? `${file.name.substring(0, 30)}...`
                                : file.name}
                            </span>
                          </FileUploaderItem>
                        ))}
                      </FileUploaderContent>
                    </FileUploader>
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Select a file to upload.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="secondary"
                type="reset"
                className="min-w-[100px] transition-colors"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                isUploading ||
                (!isAdmin && !files)
              }
              className="min-w-[100px] transition-all"
            >
              {form.formState.isSubmitting || isUploading ? (
                <Loader2Icon className="animate-spin mr-2" size={16} />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertReportDialogContent;
