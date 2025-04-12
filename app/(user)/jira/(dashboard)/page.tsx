import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getWorkspaces } from "@/features/workspaces/queries";

export default async function Home() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const workspaces = await getWorkspaces();
  if (workspaces.length === 0) {
    redirect("/jira/workspaces/create");
  } else {
    redirect(`/jira/workspaces/${workspaces[0].id}`);
  }
}
