import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "../components/sidebar";
import ContextMenu from "../components/ContextMenu";
import { ContextMenuProvider } from "../providers/ContextMenuProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { Modal } from "../components/Modal";
import { SessionProvider } from "next-auth/react";
import { ProjectsProvider } from "../providers/ProjectsProvider";
import { TasksProvider } from "../providers/UserTasksProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default async function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("/signIn");

  return (
    <div className="app__container">
      <SessionProvider session={session}>
        <ProjectsProvider>
          <TasksProvider>
            <ModalProvider>
              <Sidebar session={session} />
              <ContextMenuProvider>
                <main>
                  <ContextMenu />
                  {children}
                </main>
              </ContextMenuProvider>
              <div className="blurCircle"></div>
              <div className="blurCircle"></div>
              <div className="blurCircle"></div>
              <Modal />
            </ModalProvider>
          </TasksProvider>
        </ProjectsProvider>
        <ToastContainer />
      </SessionProvider>
    </div>
  );
}
