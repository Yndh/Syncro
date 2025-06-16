import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "./lib/prisma";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    provider?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const account = await prisma.account.findFirst({
          where: { userId: user.id },
          select: { provider: true },
        });
        session.user.provider = account?.provider || null;
      }
      return session;
    },
  },
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
