import { $Enums } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: $Enums.Status | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

interface ApiTask {
  id: string;
  name: string;
  assigneeId: string;
  dueDate: string;
  description: string | null;
  workspaceId: string;
  position: number;
  projectId: string;
  status: $Enums.Status;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    imageUrl: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
  };
  assignee: {
    id: string;
    userId: string;
    workspaceId: string;
    role: $Enums.Role;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface GetTasksResponse {
  documents: ApiTask[];
  total: number;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: UseGetTasksProps) => {
  const query = useQuery<GetTasksResponse>({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
    ],
    queryFn: async () => {
      const response = await client.api.jira.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          search: search ?? undefined,
          dueDate: dueDate ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
