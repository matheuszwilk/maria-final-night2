import { auth } from "@/auth";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};

export async function getUserId() {
  const session = await auth();
  return session?.user;
}

export async function getUserIdFromServer() {
  const session = await auth();
  const userId = session?.user;

  return userId;
}
