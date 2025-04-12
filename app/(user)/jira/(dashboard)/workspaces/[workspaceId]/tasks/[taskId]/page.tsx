import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { TaskIdClient } from "./client";

const TaskIdPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <TaskIdClient />;
};

export default TaskIdPage;
