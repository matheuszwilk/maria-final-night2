import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { WorkspaceIdSettingsClient } from "@/app/(user)/jira/(standalone)/workspaces/[workspaceId]/settings/client";

const WorkspaceIdSettingsPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
