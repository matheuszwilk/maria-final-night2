import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

const TasksPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwitcher />
    </div>
  );
};

export default TasksPage;
