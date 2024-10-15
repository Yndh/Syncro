import { SessionProvider } from "next-auth/react";
import { ContextMenuProvider } from "@/app/providers/ContextMenuProvider";
import ContextMenu from "@/app/components/ContextMenu";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

export default async function SignIn({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ContextMenuProvider>
          <ContextMenu />
          {children}
        </ContextMenuProvider>
        <div className="blurCircle"></div>
        <div className="blurCircle"></div>
        <div className="blurCircle"></div>
      </ThemeProvider>
    </SessionProvider>
  );
}
