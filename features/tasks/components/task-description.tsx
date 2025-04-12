import { useState, useRef } from "react";
import {
  PencilIcon,
  XIcon,
  PaperclipIcon,
  ArrowUpIcon,
  DownloadIcon,
  FileIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-separator";
import { toast } from "sonner";

import { Task } from "@/features/tasks/types";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useUpdateTask();

  const handleSave = async () => {
    const payload: any = { description: value ?? undefined };

    try {
      setIsUploading(true);

      if (file) {
        // Check if file is too large (50MB = 52428800 bytes)
        if (file.size > 52428800) {
          toast.error("File size exceeds 50MB limit");
          setIsUploading(false);
          return;
        }

        // Upload file using the API route
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const data = await response.json();
        payload.fileUrl = data.fileUrl;
      }

      mutate(
        {
          json: payload,
          param: { taskId: task.id },
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            setFile(null);
          },
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload file. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileNameFromUrl = (url: string): string => {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    // Decode the filename in case it's URL encoded
    try {
      return decodeURIComponent(fileName);
    } catch (e) {
      return fileName;
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          onClick={() => setIsEditing((prev) => !prev)}
          size="sm"
          variant="secondary"
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value ?? undefined}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending || isUploading}
          />
          <div className="flex justify-between items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={triggerFileInput}
              disabled={isPending || isUploading}
            >
              <PaperclipIcon className="size-4 mr-2" />
              {file ? file.name : "Attach File (max 50MB)"}
            </Button>
            <Button
              size="sm"
              className="w-fit"
              onClick={handleSave}
              disabled={isPending || isUploading}
            >
              {isPending || isUploading ? "Saving..." : "Save Changes"}
              {!isPending && !isUploading && (
                <ArrowUpIcon className="size-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            {task.description || (
              <span className="text-muted-foreground">No description set</span>
            )}
          </div>

          {task.fileUrl && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Attachment</p>
              <div className="border rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
                {task.fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) && (
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={task.fileUrl}
                      alt="Attachment preview"
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    <div className="bg-primary/10 rounded-md p-2 mr-3">
                      <FileIcon className="size-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {(() => {
                        const fileName = task.fileUrl
                          ? getFileNameFromUrl(task.fileUrl)
                          : "File";
                        return fileName.length > 20
                          ? `${fileName.substring(0, 20)}...`
                          : fileName;
                      })()}
                    </span>
                  </div>
                  <a
                    href={task.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                    title="Download file"
                  >
                    <DownloadIcon className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
