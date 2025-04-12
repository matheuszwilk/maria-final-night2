import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ProjectIdSettingsClient } from "@/app/(user)/jira/(standalone)/workspaces/[workspaceId]/projects/[projectId]/settings/client";

const ProjectIdSettingsPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <ProjectIdSettingsClient />;
};

export default ProjectIdSettingsPage;
