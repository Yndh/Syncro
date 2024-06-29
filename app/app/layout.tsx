import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "../components/sidebar";
import ContextMenu from "../components/ContextMenu";
import { ContextMenuProvider } from "../providers/ContextMenuProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { Modal } from "../components/Modal";

export default async function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("../signIn");

  return (
    <div className="dashboard">
      <ModalProvider>
        <Sidebar session={session} />
        <ContextMenuProvider>
          <main>
            <ContextMenu />
            {children}
          </main>
        </ContextMenuProvider>
        <Modal />
      </ModalProvider>
    </div>
  );
}
