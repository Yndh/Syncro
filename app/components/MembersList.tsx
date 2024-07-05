"use client";

import Image from "next/image";
import { ProjectMembership, ProjectRole } from "../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faRightFromBracket,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useRef } from "react";

interface MembersListProps {
  projectId: number;
  members: ProjectMembership[];
  role: ProjectRole;
}

export const MembersList = ({ members, role, projectId }: MembersListProps) => {
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
          <select ref={expiresSelectRef} id="expiresSelect">
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
          return;
        }

        if (data.member) {
          location.reload();
        }
      });
  };

  return (
    <div className="membersContainer">
      <h2>Members</h2>
      <ul>
        {members.map((member) => (
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
                  <FontAwesomeIcon icon={faCrown} />
                </button>
              )}
              {role == "OWNER" && member.role == "ADMIN" && (
                <button onClick={() => updateRole(member.id, "MEMBER")}>
                  <FontAwesomeIcon icon={faUser} />
                </button>
              )}
              {(role == "ADMIN" || role == "OWNER") &&
                member.role === "MEMBER" && (
                  <button>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </button>
                )}
            </div>
          </li>
        ))}
        {role == "ADMIN" ||
          (role == "OWNER" && (
            <li className="invite">
              <button onClick={handleModal}>
                <FontAwesomeIcon icon={faUserPlus} /> Invite Members
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
