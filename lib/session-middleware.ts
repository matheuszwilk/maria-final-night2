import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/auth";
import { User, UserRole } from "@prisma/client";

type AdditionalContext = {
  Variables: {
    user: Omit<User, "password" | "name" | "email" | "image">;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const session = await auth();

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user: Omit<User, "password" | "name" | "email" | "image"> = {
      id: session.user.id,
      emailVerified: null, // Add the missing emailVerified field
      role: session.user.role as UserRole,
      isTwoFactorEnabled: session.user.isTwoFactorEnabled,
    };

    c.set("user", user);

    await next();
  }
);
