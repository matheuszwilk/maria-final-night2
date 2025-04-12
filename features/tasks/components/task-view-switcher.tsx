"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DataFilters } from "./data-filters";

import { columns } from "@/features/tasks/components/columns";
import { DataKanban } from "@/features/tasks/components/data-kanban";
import { DataCalendar } from "@/features/tasks/components/data-calendar";
import { DataGantt } from "@/features/tasks/components/data-gantt";

import { Task, TaskStatus } from "@/features/tasks/types";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useTaskFilters } from "@/features/tasks/hooks/use-task-filters";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useBulkUpdateTasks } from "@/features/tasks/api/use-bulk-update-tasks";
import { CustomDataTable } from "@/components/custon-table";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();

  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate,
  });

  const onKanbanChange = useCallback(
    (
      tasks: { id: string; status: keyof typeof TaskStatus; position: number }[]
    ) => {
      bulkUpdate({
        json: { tasks },
      });
    },
    [bulkUpdate]
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full border rounded-lg bg-background dark:bg-background"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto bg-background dark:bg-muted">
            <TabsTrigger
              className="h-8 w-full lg:w-auto text-foreground dark:text-foreground"
              value="table"
            >
              Table
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto text-foreground dark:text-foreground"
              value="kanban"
            >
              Kanban
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto text-foreground dark:text-foreground"
              value="calendar"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto text-foreground dark:text-foreground"
              value="gantt"
            >
              Gantt
            </TabsTrigger>
          </TabsList>
          <Button onClick={open} size="sm" className="w-full lg:w-auto">
            <PlusIcon className="size-4" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center bg-card dark:bg-card">
            <Loader className="size-5 animate-spin text-muted-foreground dark:text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <CustomDataTable
                columns={columns as any}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                onChange={onKanbanChange}
                data={(tasks?.documents ?? []) as Task[]}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar data={(tasks?.documents ?? []) as Task[]} />
            </TabsContent>
            <TabsContent value="gantt" className="mt-0 h-full pb-4">
              {view === "gantt" && (
                <DataGantt data={(tasks?.documents ?? []) as Task[]} />
              )}
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
