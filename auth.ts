import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import github from "next-auth/providers/github";
import { prisma } from "./lib/prisma";
import GitHub from "next-auth/providers/github";

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
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  debug: true,
  trustHost: true,
  session: {
    strategy: "database",
    maxAge: 31 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signIn",
  },
});
