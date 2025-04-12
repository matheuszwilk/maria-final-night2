import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ProjectIdClient } from "@/app/(user)/jira/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/client";

const ProjectIdPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return <ProjectIdClient />;
};

export default ProjectIdPage;
