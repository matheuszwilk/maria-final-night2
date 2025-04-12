import { MoreHorizontal } from "lucide-react";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { DottedSeparator } from "@/components/dotted-separator";

import { TaskDate } from "@/features/tasks/components/task-date";
import { TaskActions } from "@/features/tasks/components/task-actions";

import { Task } from "@/features/tasks/types";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <div className="bg-background p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2 text-foreground">{task.name}</p>
        <TaskActions id={task.id} projectId={task.projectId}>
          <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-muted-foreground hover:opacity-75 transition" />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee.name}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-muted" />
        <TaskDate
          value={task.dueDate}
          className="text-xs text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          image={task.project.imageUrl ?? undefined}
          fallbackClassName="text-[10px]"
        />
        <span className="text-xs font-medium text-foreground">
          {task.project.name}
        </span>
      </div>
    </div>
  );
};
