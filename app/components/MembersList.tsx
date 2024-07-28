"use client";

import Image from "next/image";
import { Project, ProjectMembership, ProjectRole } from "../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faRightFromBracket,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useRef } from "react";
import { faSquareWebAwesomeStroke, faSquareWebAwesome } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useSession } from "next-auth/react";

interface MembersListProps {
  projectId: number;
  project: Project;
  role: ProjectRole;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

export const MembersList = ({
  project,
  role,
  projectId,
  setProject,
}: MembersListProps) => {
  const session = useSession()
  const { setModal } = useModal();
  const usesSelectRef = useRef<HTMLSelectElement>(null);
  const expiresSelectRef = useRef<HTMLSelectElement>(null);

  const handleModal = () => {
    setModal({
      content: (
        <form onSubmit={handleForm}>
          <h2>Create invite</h2>

          <label htmlFor="usesSelect">Uses</label>
          <select ref={usesSelectRef} id="usesSelect">
            <option value="never" defaultChecked={true}>
              Bez limitów
            </option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <label htmlFor="expiresSelect">Expires</label>
          <select
            ref={expiresSelectRef}
            id="expiresSelect"
            defaultValue="10080"
          >
            <option value="30">30 min</option>
            <option value="60">1 h</option>
            <option value="360">6 h</option>
            <option value="720">12 h</option>
            <option value="1440">1 dzień</option>
            <option value="10080" defaultChecked={true}>
              7 dni
            </option>
            <option value="never">Nigdy</option>
          </select>

          <button>Create Invite</button>
        </form>
      ),
      setModal,
    });
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedUses = usesSelectRef.current?.value;
    if (!selectedUses) {
      alert("Select uses");
      return;
    }

    let uses: number | null = null;
    if (selectedUses !== "never") {
      uses = parseInt(selectedUses);
    }

    const selectedExpireDate = expiresSelectRef.current?.value;
    if (!selectedExpireDate) {
      alert("Select expiration date");
      return;
    }

    let expirationDate: Date | null = null;
    if (selectedExpireDate !== "never") {
      const currentTime = new Date();
      expirationDate = new Date(
        currentTime.getTime() + parseInt(selectedExpireDate) * 60000
      );
    }

    setModal(null);

    await fetch(`/api/project/${projectId}/invites`, {
      method: "POST",
      body: JSON.stringify({
        maxUses: uses,
        expires: expirationDate,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.invite) {
          alert("ok");
          console.log(data.invite);
        }
      });
  };

  const updateRole = async (membershipId: number, role: "ADMIN" | "MEMBER") => {
    const prevProject = {...project}

    setProject((prevProj) => {
      if (prevProj) {
        return {
          ...prevProj,
          members: prevProj.members.map((member) =>
            member.id === membershipId
              ? { ...member, role: role as ProjectRole }
              : member
          ),
        };
      }
      return undefined;
    });

    await fetch(`/api/project/${projectId}/role`, {
      method: "POST",
      body: JSON.stringify({
        membershipId: membershipId,
        role: role,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setProject(prevProject)
          return;
        }

        if (data.project) {
          setProject(data.project);
        }
      });
  };

  const kickUser = async (membershipId: number) => {
    const prevProject = {...project}
    
    setProject((prevProj) => {
      if (prevProj) {
        return {
          ...prevProj,
          members: prevProj.members.map((member) =>
            member.id === membershipId
              ? { ...member, role: role }
              : member
          ),
        };
      }
      return undefined;
    });
    
    await fetch(`/api/project/${projectId}/members/${membershipId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setProject(prevProject)
          return;
        }

        if (data.project) {
          setProject(data.project);
        }
      });
  };

  console.log(project)

  return (
    <div className="membersContainer">
      <h2>Members</h2>
      <ul>
        {project.members.map((member) => (
          <li key={member.id}>
            <Image
              src={member.user.image}
              alt={member.user.name}
              width={40}
              height={40}
            />
            <div className="details">
              <p>
                {member.user.name} <span className="role">{member.role}</span>
              </p>
              <span>{member.user.email}</span>
            </div>
            <div className="actions">
              {role == "OWNER" && member.role == "MEMBER" && (
                <button onClick={() => updateRole(member.id, "ADMIN")}>
                  <FontAwesomeIcon icon={faSquareWebAwesomeStroke as IconProp} />
                </button>
              )}
              {role == "OWNER" && member.role == "ADMIN" && (
                <button onClick={() => updateRole(member.id, "MEMBER")}>
                  <FontAwesomeIcon icon={faSquareWebAwesome as IconProp} />
                </button>
              )}
              {(((role == "ADMIN" || role == "OWNER") &&
                member.role != "OWNER") && (member.userId !== session?.data?.user?.id) && (
                  <button onClick={() => kickUser(member.id)}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </button>
                ))}
            </div>
          </li>
        ))}
        {(role == "ADMIN" ||
          role == "OWNER") && (
            <li className="invite">
              <button onClick={handleModal}>
                <FontAwesomeIcon icon={faUserPlus} /> Invite Members
              </button>
            </li>
          )}
      </ul>
    </div>
  );
};
