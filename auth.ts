import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import github from "next-auth/providers/github";
import { prisma } from "./lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      provider: string | null;
      id: string | null;
    } & DefaultSession["user"];
  }

  interface Token {
    provider: string | null;
    id: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [github],
  debug: true,
  callbacks: {
    jwt: async ({ token, user, account, trigger, session }) => {
      if (trigger == "update" && session?.name) {
        token.name = session.name;
      }
      if (account) token.provider = account.provider;
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.provider = token.provider as string;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 31 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signIn",
  },
});
