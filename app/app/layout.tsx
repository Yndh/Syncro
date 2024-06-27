import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "../components/sidebar";
import ContextMenu from "../components/ContextMenu";
import { ContextMenuProvider } from "../providers/ContextMenuProvider";

export default async function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("../signIn");

  return (
    <div className="dashboard">
      <Sidebar session={session} />
      <ContextMenuProvider>
        <main>
          <ContextMenu />
          {children}
        </main>
      </ContextMenuProvider>
    </div>
  );
}
