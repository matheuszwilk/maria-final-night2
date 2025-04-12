import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.jira.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.jira.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.jira.tasks[":taskId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        const responseData = await response.json();
        if (
          "error" in responseData &&
          responseData.error === "Only admins or task assignees can edit tasks"
        ) {
          throw new Error(
            "You must be an admin or the task assignee to edit this task"
          );
        }
        if (
          "error" in responseData &&
          responseData.error === "Only admins can change due date"
        ) {
          throw new Error("Only administrators can modify the due date");
        }
        if ("error" in responseData && responseData.error === "Unauthorized") {
          throw new Error("You are not authorized to perform this action");
        }
        if (
          "error" in responseData &&
          responseData.error === "Task not found"
        ) {
          throw new Error("The requested task was not found");
        }
        throw new Error("Failed to update task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
