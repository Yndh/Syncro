import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [github],
  debug: true,
  callbacks: {
    session: async ({session, user}) => {
      session.user.id = user.id
      return session
    }
  }
});
