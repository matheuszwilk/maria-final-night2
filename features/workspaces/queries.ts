import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export const getWorkspaces = async () => {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  const members = await db.members.findMany({
    where: {
      userId: user.id,
    },
  });

  if (members.length === 0) {
    return [];
  }
  const workspaceIds = members.map((member) => member.workspaceId);

  const workspaces = await db.workspaces.findMany({
    where: {
      id: {
        in: workspaceIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return workspaces;
};
