"use client";

import Image from "next/image";
import {
  Invite,
  Project,
  ProjectMembership,
  ProjectRole,
} from "../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCalendarDays,
  faCalendarXmark,
  faCopy,
  faCrown,
  faHammer,
  faHashtag,
  faInfinity,
  faPlus,
  faRightFromBracket,
  faUser,
  faUserPlus,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useRef, useState } from "react";
import {
  faSquareWebAwesomeStroke,
  faSquareWebAwesome,
} from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useSession } from "next-auth/react";
import Select from "./Select";
import getUrl from "@/lib/getUrl";
import QRCode from "react-qr-code";

interface MembersListProps {
  projectId: number;
  project: Project;
  role: ProjectRole;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

const options = [
  {
    value: ProjectRole.ADMIN as string,
    label: (
      <div className="roleSelect admin">
        <FontAwesomeIcon icon={faHammer} />
        <span>Admin</span>
      </div>
    ),
  },
  {
    value: ProjectRole.MEMBER as string,
    label: (
      <div className="roleSelect member">
        <FontAwesomeIcon icon={faUser} />
        <span>Member</span>
      </div>
    ),
  },
];

const ownerOption = [
  {
    value: ProjectRole.OWNER as string,
    label: (
      <div className="roleSelect owner">
        <FontAwesomeIcon icon={faCrown} />
        <span>Owner</span>
      </div>
    ),
  },
];

const usesOptions = [
  {
    value: 1,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>1</span>
      </div>
    ),
  },
  {
    value: 5,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>5</span>
      </div>
    ),
  },
  {
    value: 10,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>10</span>
      </div>
    ),
  },
  {
    value: 20,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>20</span>
      </div>
    ),
  },
  {
    value: 25,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>25</span>
      </div>
    ),
  },
  {
    value: "never",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faInfinity} />
        <span>Unlimited</span>
      </div>
    ),
  },
];

const expirationOptions = [
  {
    value: 30,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>30 min</span>
      </div>
    ),
  },
  {
    value: 60,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 h</span>
      </div>
    ),
  },
  {
    value: 360,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>6 h</span>
      </div>
    ),
  },
  {
    value: 720,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>12 h</span>
      </div>
    ),
  },
  {
    value: 1440,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 day</span>
      </div>
    ),
  },
  {
    value: 10080,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 week</span>
      </div>
    ),
  },
  {
    value: "never",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarXmark} />
        <span>Never</span>
      </div>
    ),
  },
];

export const MembersList = ({
  project,
  role,
  projectId,
  setProject,
}: MembersListProps) => {
  const session = useSession();
  const { setModal } = useModal();
  const [inviteMaxUses, setInviteMaxUses] = useState<string | number>(1);
  const [inviteExpirationDate, setInviteExpirationDate] = useState<
    string | number
  >(30);
  const [searchQuery, setSearchQuery] = useState("");

  const handleModal = () => {
    setModal({
      title: "New Invite",
      content: (
        <form onSubmit={handleForm} id="inviteForm">
          <h2>Create invite</h2>

          <div className="formRow">
            <label>
              <p>Uses</p>
              <span>Number of members that can join</span>
            </label>

            <Select
              options={usesOptions}
              selectedOption={usesOptions[0]}
              onChange={(option) => {
                setInviteMaxUses(option?.value ?? 1);
              }}
            />
          </div>

          <div className="formRow">
            <label htmlFor="">
              <p>Expiration</p>
              <span>Expiration date of invite</span>
            </label>
            <Select
              options={expirationOptions}
              selectedOption={expirationOptions[0]}
              onChange={(option) => {
                setInviteExpirationDate(option?.value ?? 30);
              }}
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="inviteForm">
            Create invite
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inviteMaxUses) {
      alert("Select uses");
      return;
    }

    let uses: number | null = null;
    if (inviteMaxUses !== "never") {
      uses = parseInt(inviteMaxUses.toString());
    }

    if (!inviteExpirationDate) {
      alert("Select expiration date");
      return;
    }

    let expirationDate: Date | null = null;
    if (inviteExpirationDate !== "never") {
      const currentTime = new Date();
      expirationDate = new Date(
        currentTime.getTime() +
          parseInt(inviteExpirationDate.toString()) * 60000
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
          console.log(data.invite);
          displayInvite(data.invite);
        }
      });
  };

  const displayInvite = (invite: Invite) => {
    setModal({
      title: "Invite",
      content: (
        <>
          <div className="row">
            <label htmlFor="">
              <p>Invite</p>
              Join to project using this link
            </label>

            <div className="link">
              <input
                type="text"
                disabled={true}
                value={`${getUrl()}/${invite.linkId}`}
              />
              <button>
                <FontAwesomeIcon icon={faCopy} />
                Copy
              </button>
            </div>
          </div>

          <div className="qrCode">
            <span>or scan QR Code</span>
            <QRCode value={`${getUrl()}/${invite.linkId}`} bgColor="transparent"/>
          </div>
        </>
      ),
      bottom: (
        <>
          <button className="secondary" onClick={() => setModal(null)}>
            Close
          </button>
        </>
      ),
      setModal,
    });
  };

  const updateRole = async (membershipId: number, role: "ADMIN" | "MEMBER") => {
    const prevProject = { ...project };

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
          setProject(prevProject);
          return;
        }

        if (data.project) {
          setProject(data.project);
        }
      });
  };

  const kickUser = async (membershipId: number) => {
    const prevProject = { ...project };

    setProject((prevProj) => {
      if (prevProj) {
        return {
          ...prevProj,
          members: prevProj.members.map((member) =>
            member.id === membershipId ? { ...member, role: role } : member
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
          setProject(prevProject);
          return;
        }

        if (data.project) {
          setProject(data.project);
        }
      });
  };


  const filteredMembers = project.members.filter(
    (member) =>
      member.user.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="membersContainer">
      <div className="membersHeader">
        <div className="title">
          <h1>Members</h1>
          <span className="count">{project.members.length}</span>
        </div>

        <div className="buttons">
          <input type="text" placeholder="🔎 Search for members..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}/>
          {(role == "ADMIN" || role == "OWNER") && (
            <button onClick={handleModal}>
              <FontAwesomeIcon icon={faPlus} />
              Invite member
            </button>
          )}
        </div>
      </div>
      <div className="membersContent">
        <ul>
          {filteredMembers.map((member) => (
            <li key={member.id}>
              <Image
                src={member.user.image}
                alt={member.user.name}
                width={40}
                height={40}
              />
              <p>{member.user.name}</p>
              <span>{member.user.email}</span>
              <div className="actions">
                <Select
                  options={
                    member.role == "OWNER"
                      ? ownerOption
                      : [
                          {
                            ...options[0],
                            disabled: role !== "OWNER",
                          },
                          options[1],
                        ]
                  }
                  selectedOption={
                    member.role == "OWNER"
                      ? ownerOption[0]
                      : options.find(
                          (option) => option.value.toUpperCase() == member.role
                        )
                  }
                  disabled={
                    member.role == "OWNER" ||
                    role == "MEMBER" ||
                    (role == "ADMIN" && member.role == "ADMIN")
                  }
                  onChange={(option) => {
                    updateRole(
                      member.id,
                      option?.value.toString().toUpperCase() as "ADMIN" | "MEMBER"
                    );
                  }}
                />
                {(role == "ADMIN" || role == "OWNER") && (
                  <button
                    onClick={() => kickUser(member.id)}
                    disabled={
                      (role === "ADMIN" &&
                        (member.role == "OWNER" || member.role == "ADMIN")) ||
                      member.role == "OWNER"
                    }
                  >
                    <FontAwesomeIcon icon={faUserSlash} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="membersRolesDescription">
          <h2>Access control</h2>

          <div className="roleDescription">
            <p>Owner</p>
            <span>
              Full control of the project. Manages settings, assigns roles, and
              oversees all tasks and members.
            </span>
          </div>

          <div className="roleDescription">
            <p>Administrator</p>
            <span>
              Manages day-to-day tasks, assigns work, and tracks progress. Can
              invite and remove members.
            </span>
          </div>

          <div className="roleDescription">
            <p>Member</p>
            <span>
              Works on assigned tasks, collaborates with the team, and updates
              progress. Limited to task-level actions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
