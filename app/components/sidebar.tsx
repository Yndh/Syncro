"use client";

import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import SignOutButton from "./signOut";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faChevronUp,
  faCog,
  faDiagramProject,
  faHouse,
  faList,
  faTable,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { useProjects } from "../providers/ProjectsProvider";
import { useModal } from "../providers/ModalProvider";
import getUrl from "@/lib/getUrl";

interface ISidebar {
  session: Session;
}

const Sidebar = ({ session }: ISidebar) => {
  const [projectId, setProjectId] = useState<number | boolean>(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null)
  const projectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const inviteInputRef = useRef<HTMLInputElement>(null)
  const { projects, fetchProjects } = useProjects();
  const { setModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (projects != null && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }else{
      setProjectId(false)
    }
  }, [projects])


  const projectModal = () => {
    if (projectId) return;

    setModal({
      title: "",
      content: (
        <>
          <div className="header">
            <h2>Join or Create a Project</h2>
            <p>
              Select an option below to either join an existing project or
              create a new one. Collaborate and make an impact!
            </p>
          </div>
          <div className="createOrJoin">
            <button onClick={createProjectModal}>Create Project</button>

            <span className="or">or</span>

            <button onClick={joinProjectModal}>Join Project</button>
          </div>
        </>
      ),
      bottom: (
        <>
        <button className="secondary" onClick={() => setModal(null)}>Cancel</button>
        </>
      ),
      setModal,
    });
  };

  const createProjectModal = () => {
    setModal({
      title: "Create Project",
      content: (
        <form onSubmit={createProject} id="createProjectForm">
          <div className="formRow">
            <label htmlFor="projectName">
              <p>Name</p>
              <span>Enter the name of your project</span>
            </label>

            <input type="text" placeholder="Project name..." ref={projectNameInputRef} id="projectName"/>
          </div>

          <div className="formRow">
            <label htmlFor="projectDescription">
              <p>Description</p>
              <span>Provide a brief overview of your project</span>
            </label>

            <textarea  placeholder="Project name..." ref={projectDescriptionTextAreaRef} id="projectDescription"/>
          </div>
        </form>
      ),
      bottom: (
        <>
        <button type="submit" form="createProjectForm">Create Project</button>
        <button className="secondary" onClick={() => setModal(null)}>Cancel</button>
        </>
      ),
      setModal
    })
  }

  const joinProjectModal = () => {
    setModal({
      title: "Join Project",
      content: (
        <form onSubmit={joinProject} id="joinProjectForm">
          <div className="formRow">
            <label htmlFor="projectInviteUrl">
              <p>Invite</p>
              <span>Enter the invite URL or code</span>
            </label>

            <input type="text" placeholder={`${getUrl()}/join/ABC123`} ref={inviteInputRef} id="projectInviteUrl"/>
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="joinProjectForm">Join</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal
    })
  }

  const createProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = projectNameInputRef.current?.value as string;
    if (name.trim() === "") {
      alert("Project name cannot be empty");
      return;
    }

    const description = projectDescriptionTextAreaRef.current?.value as string;
    
    
    await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        if(data.id){
          router.push(`/app/projects/${data.id}`);
          fetchProjects()
          setModal(null)
        }
      });
  }

  const joinProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const inviteUrl = inviteInputRef.current?.value as string
    const codeMatch = inviteUrl.match(/invite\/([^/]+)/);
    const code = codeMatch ? codeMatch[1] : inviteUrl.trim()


    if(!code){
      alert("invalid code")
      return
    }

    try{
      await fetch(`/api/invite/${code}/join`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
            return;
          }
  
          if (data.projectId) {
            router.push(`/app/projects/${data.projectId}`);
            setModal(null)
            fetchProjects()
          }
        });
    }catch(e){
      console.error(`Error joining project: ${e}`)
      alert(e)
    }
  }
  

  return (
    <div className="sidebar">
      <div className="logo">
        <Image src="/logo.svg" alt="Logo" width={35} height={35} />
        <h1>Syncro</h1>
      </div>

      <nav>
        <p>Navigation</p>
        <ol>
          <li className={pathname == "/app" ? "active" : ""}>
            <Link href={"/app"}>
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faTable} />
                </div>
                <span>Dashboard</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
          <li className={pathname == "/app/projects" ? "active" : ""}>
            <Link
              href={projectId ? `/app/projects/${projectId}` : ""}
              onClick={projectModal}
            >
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faDiagramProject} />
                </div>
                <span>Projects</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
          <li className={pathname == "/app/tasks" ? "active" : ""}>
            <Link href={"/app/projects"}>
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faList} />
                </div>
                <span>My Tasks</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
        </ol>
        <p>Other</p>
        <ol>
          <li>
            <div className={"navElement"}>
              <div className="icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <span>User</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </li>
          <li>
            <div className={"navElement"}>
              <div className="icon">
                <FontAwesomeIcon icon={faCog} />
              </div>
              <span>Settings</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </li>
        </ol>
      </nav>

      <div className="userContainer">
        <div className="user">
          {session?.user ? (
            <div className="user">
              <Image
                src={session?.user.image as string}
                alt="Profile Image"
                width={40}
                height={40}
              />
              <div className="userDetails">
                <p>{session?.user.name as string}</p>
                <span>{session?.user.email as string}</span>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <p>There was an error while loading session</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;