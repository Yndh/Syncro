"use client";

import { Session } from "next-auth";
import { useState } from "react";
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
import { usePathname } from "next/navigation";

interface ISidebar {
  session: Session;
}

const Sidebar = ({ session }: ISidebar) => {
  const [isNavigationShown, setIsNavigationShown] = useState<boolean>(true);

  const pathname = usePathname();

  console.log(pathname);

  const toggleNavigationVisibility = () => {
    setIsNavigationShown(!isNavigationShown);
  };

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
            <Link href={"/app/projects"}>
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
