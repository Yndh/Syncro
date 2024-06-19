"use client";

import { Session } from "next-auth";
import { useState } from "react";
import SignOutButton from "./signOut";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faDiagramProject,
  faHouse,
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
      <h2>Project manager</h2>
      {session?.user ? (
        <div className="user">
          <Image
            src={session?.user.image as string}
            alt="Profile Image"
            width={50}
            height={50}
          />
          <div className="userDetails">
            <p>{session?.user.name as string}</p>
            <span>{session?.user.email as string}</span>
          </div>
        </div>
      ) : (
        <p>There was an error while loading session</p>
      )}
      <nav>
        <div className="header" onClick={toggleNavigationVisibility}>
          <p>Navigation</p>
          <FontAwesomeIcon
            icon={faChevronUp}
            className={!isNavigationShown ? "closed" : ""}
          />
        </div>
        <ol className={!isNavigationShown ? "hidden" : ""}>
          <li className={pathname == "/app" ? "active" : ""}>
            <Link href={"/app"}>
              <FontAwesomeIcon icon={faHouse} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={pathname == "/app/projects" ? "active" : ""}>
            <Link href={"app/projects"}>
              <FontAwesomeIcon icon={faDiagramProject} />
              <span>Projects</span>
            </Link>
          </li>
        </ol>
      </nav>
      <SignOutButton />
    </div>
  );
};

export default Sidebar;
