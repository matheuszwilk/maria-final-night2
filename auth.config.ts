import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          // Ensure user.password is a string before comparing
          const userPassword = user.password;

          // Dynamically import bcrypt to avoid Edge Runtime issues
          const passwordsMatch = await import("bcryptjs").then(
            async (module) => {
              return await module.compare(password, userPassword);
            }
          );

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
