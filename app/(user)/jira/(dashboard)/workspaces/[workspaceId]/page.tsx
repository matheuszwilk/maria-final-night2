import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { WorkspaceIdClient } from "@/app/(user)/jira/(dashboard)/workspaces/[workspaceId]/client";

const WorkspaceIdPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <WorkspaceIdClient />;
};

export default WorkspaceIdPage;

export const metadata = {
  title: "Dashboard",
  description: "Monitor and manage your tasks and projects",
};
