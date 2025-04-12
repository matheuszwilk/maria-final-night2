import { $Enums, members, projects, tasks } from "@prisma/client";

export const TaskStatus = { ...$Enums.Status };

export type Task = Omit<tasks, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  fileUrl: string | null;
  project: Omit<projects, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };
  assignee: Omit<members, "createdAt" | "updatedAt"> & {
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
};
