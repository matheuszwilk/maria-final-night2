import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";

const WorkspaceCreatePage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspaceCreatePage;
