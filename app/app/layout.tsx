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
import { ToastContainerComponent } from "../components/ToastContainerComponent";
import { PwaPrompt } from "../components/PwaPrompt";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Syncro",
  description: "",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My App",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color:
        "linear-gradient(120deg, rgba(243, 246, 248, 1) 0%, rgba(241, 245, 230, 1) 100%)",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: " linear-gradient(120deg, #1C1C1C 0%, #1C1C1C 100%)",
    },
  ],
};

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
              <Sidebar />
              <ContextMenuProvider>
                <main>
                  <ContextMenu />
                  <PwaPrompt />
                  {children}
                </main>
              </ContextMenuProvider>
              <Modal />
            </ModalProvider>
          </TasksProvider>
        </ProjectsProvider>
        <ToastContainerComponent />
      </SessionProvider>
    </div>
  );
}
