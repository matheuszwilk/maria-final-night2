import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { MembersList } from "@/features/workspaces/components/members-list";

const WorkspaceIdMembersPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="w-full lg:max-w-xl bg-background text-foreground">
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
