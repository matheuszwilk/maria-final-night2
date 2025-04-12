import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { WorkspaceIdJoinClient } from "@/app/(user)/jira/(standalone)/workspaces/[workspaceId]/join/[inviteCode]/client";

const WorkspaceIdJoinPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <WorkspaceIdJoinClient />;
};

export default WorkspaceIdJoinPage;
