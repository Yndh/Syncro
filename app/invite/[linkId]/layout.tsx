import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ContextMenuProvider } from "@/app/providers/ContextMenuProvider";
import ContextMenu from "@/app/components/ContextMenu";

export default async function Invitation({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("../signIn");

  return (
    <div className="invitePage">
      <SessionProvider>
        <ContextMenuProvider>
          <ContextMenu />
          {children}
        </ContextMenuProvider>
      </SessionProvider>
    </div>
  );
}
