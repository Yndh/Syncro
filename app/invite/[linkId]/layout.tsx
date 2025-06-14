import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ContextMenuProvider } from "@/app/providers/ContextMenuProvider";
import ContextMenu from "@/app/components/ContextMenu";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

export default async function Invitation({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("../signIn");

  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <div className="blurCircle"></div>
        <div className="blurCircle"></div>
        <div className="blurCircle"></div>
      </ThemeProvider>
    </SessionProvider>
  );
}
