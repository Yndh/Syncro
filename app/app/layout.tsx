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
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { ToastContainerComponent } from "../components/ToastContainerComponent";

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
        <ThemeProvider>
          <ProjectsProvider>
            <TasksProvider>
              <ModalProvider>
                <Sidebar />
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
          <ToastContainerComponent />
        </ThemeProvider>
      </SessionProvider>
    </div>
  );
}
