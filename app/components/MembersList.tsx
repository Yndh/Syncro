"use client";

import Image from "next/image";
import { Project, ProjectRole } from "../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCalendarXmark,
  faCopy,
  faCrown,
  faHammer,
  faHashtag,
  faInfinity,
  faPlus,
  faUser,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useState, useCallback, useMemo } from "react";
import Select from "./Select";
import getUrl from "@/lib/getUrl";
import QRCode from "react-qr-code";
import { useProjects } from "../providers/ProjectsProvider";
import { toast } from "react-toastify";
import { useTheme } from "../providers/ThemeProvider";

interface MembersListProps {
  projectId: string;
  project: Project;
  role: ProjectRole;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

const options = [
  {
    value: ProjectRole.ADMIN,
    label: (
      <div className="roleSelect admin">
        <FontAwesomeIcon icon={faHammer} />
        <span>Admin</span>
      </div>
    ),
  },
  {
    value: ProjectRole.MEMBER,
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
    value: ProjectRole.OWNER,
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
  const { setModal } = useModal();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboardFallback = useCallback((link: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Text copied to clipboard!");
    } catch (err) {
      toast.error(
        "Uh-oh! We couldn't copy the invite link. Give it another try!"
      );
    }
  }, []);

  const copyLink = useCallback(
    async (link: string) => {
      try {
        await navigator.clipboard.writeText(link);
        toast.success(
          "Success! The invite link has been copied to your clipboard!"
        );
      } catch (err) {
        copyToClipboardFallback(link);
      }
    },
    [copyToClipboardFallback]
  );

  const displayInvite = useCallback(
    (invite: { linkId: string }) => {
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
                  value={`${getUrl()}/invite/${invite.linkId}`}
                />
                <button
                  onClick={() =>
                    copyLink(`${getUrl()}/invite/${invite.linkId}`)
                  }
                >
                  <FontAwesomeIcon icon={faCopy} />
                  Copy
                </button>
              </div>
            </div>
            <div className="qrCode">
              <span>Or Scan QR Code</span>
              <QRCode
                value={`${getUrl()}/invite/${invite.linkId}`}
                bgColor="transparent"
                className="qrCodeElement"
                fgColor={theme == "dark" ? "#FFFFFFb3" : "#141515b3"}
              />
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
    },
    [setModal, copyLink, theme]
  );

  const handleForm = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const getSelectedValue = (id: string, defaultOption: any) => {
        const selectedDiv = document.querySelector(`#${id}`);
        return selectedDiv?.getAttribute("data-value") ?? defaultOption.value;
      };

      const inviteMaxUses = getSelectedValue("maxUsesSelect", usesOptions[0]);
      let uses: number | null = null;
      if (inviteMaxUses !== "never") {
        uses = parseInt(inviteMaxUses.toString());
      } else if (inviteMaxUses === undefined) {
        toast.warn(
          "Hold on! You need to specify the maximum number of uses for this invite."
        );
        return;
      }

      const inviteExpirationDate = getSelectedValue(
        "expirationDateSelect",
        expirationOptions[0]
      );
      let expirationDate: Date | null = null;
      if (inviteExpirationDate !== "never") {
        const currentTime = new Date();
        expirationDate = new Date(
          currentTime.getTime() +
            parseInt(inviteExpirationDate.toString()) * 60000
        );
      } else if (inviteExpirationDate === undefined) {
        toast.warn(
          "Oops! Don’t forget to set an expiration date for the invite."
        );
        return;
      }

      setModal(null);

      try {
        const res = await fetch(`/api/project/${projectId}/invites`, {
          method: "POST",
          body: JSON.stringify({
            maxUses: uses,
            expires: expirationDate,
          }),
        });
        const data = await res.json();

        if (data.error) {
          toast.error(
            "Oops! The invite didn’t want to be created. Maybe it needs a pep talk?"
          );
          return;
        }

        if (data.invite) {
          displayInvite(data.invite);
          setProject((prevProject) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              projectInvitations: [
                ...(prevProject.projectInvitations || []),
                data.invite,
              ],
            };
          });

          toast.success(
            "Success! Your invite has been sent out—let the fun begin!"
          );
        }
      } catch (err) {
        toast.error("An unexpected error occurred while creating the invite.");
      }
    },
    [setModal, projectId, setProject, displayInvite]
  );

  const handleModal = useCallback(() => {
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
              id="maxUsesSelect"
              onChange={() => {}}
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
              id="expirationDateSelect"
              onChange={() => {}}
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
  }, [setModal, handleForm]);

  const updateRole = useCallback(
    async (membershipId: number, newRole: "ADMIN" | "MEMBER") => {
      const prevProject = { ...project };

      setProject((prevProj) => {
        if (prevProj) {
          return {
            ...prevProj,
            members: prevProj.members.map((member) =>
              member.id === membershipId
                ? { ...member, role: newRole as ProjectRole }
                : member
            ),
          };
        }
        return undefined;
      });

      try {
        const res = await fetch(`/api/project/${projectId}/role`, {
          method: "POST",
          body: JSON.stringify({
            membershipId: membershipId,
            role: newRole,
          }),
        });
        const data = await res.json();

        if (data.error) {
          toast.error(
            "Oops! We couldn't update the member's role. Please try again!"
          );
          setProject(prevProject);
          return;
        }

        if (data.project) {
          setProject(data.project);
          toast.success("Success! The member's role has been updated!");
        }
      } catch (err) {
        toast.error("An unexpected error occurred while updating the role.");
        setProject(prevProject);
      }
    },
    [project, projectId, setProject]
  );

  const kickUser = useCallback(
    async (membershipId: number) => {
      try {
        const res = await fetch(
          `/api/project/${projectId}/members/${membershipId}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();

        if (data.error) {
          toast.error("Uh-oh! We couldn't kick the user. Please try again!");
          return;
        }

        if (data.project) {
          setProject(data.project);
          toast.success("Success! The user has been removed from the project!");
        }
      } catch (err) {
        toast.error("An unexpected error occurred while kicking the user.");
      }
    },
    [projectId, setProject]
  );

  const filteredMembers = useMemo(() => {
    if (!project?.members) {
      return [];
    }
    const lowerCaseSearchQuery = searchQuery.toLowerCase().trim();
    return project.members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        member.user.email.toLowerCase().includes(lowerCaseSearchQuery) ||
        member.role.toLowerCase().includes(lowerCaseSearchQuery)
    );
  }, [project?.members, searchQuery]);

  return (
    <div className="membersContainer">
      <div className="membersHeader">
        <div className="title">
          <h1>Members</h1>
          <span className="count">
            {project?.members ? project.members.length : 0}
          </span>
        </div>
        <div className="buttons">
          <input
            type="text"
            placeholder="🔎 Search for members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(role === ProjectRole.ADMIN || role === ProjectRole.OWNER) && (
            <button onClick={handleModal}>
              <FontAwesomeIcon icon={faPlus} />
              Invite member
            </button>
          )}
        </div>
      </div>
      <div className="membersContent">
        <ul className="membersUl">
          {filteredMembers.map((member) => (
            <li key={member.id} className="membersLi">
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
                    member.role === ProjectRole.OWNER
                      ? ownerOption
                      : [
                          {
                            ...options[0],
                            disabled: role !== ProjectRole.OWNER,
                          },
                          options[1],
                        ]
                  }
                  selectedOption={
                    member.role === ProjectRole.OWNER
                      ? ownerOption[0]
                      : options.find(
                          (option) => option.value.toUpperCase() === member.role
                        )
                  }
                  disabled={
                    member.role === ProjectRole.OWNER ||
                    role === ProjectRole.MEMBER ||
                    (role === ProjectRole.ADMIN &&
                      member.role === ProjectRole.ADMIN)
                  }
                  onChange={(option) => {
                    updateRole(
                      member.id,
                      option?.value.toString().toUpperCase() as
                        | "ADMIN"
                        | "MEMBER"
                    );
                  }}
                />
                {(role === ProjectRole.ADMIN || role === ProjectRole.OWNER) && (
                  <button
                    onClick={() => kickUser(member.id)}
                    disabled={
                      (role === ProjectRole.ADMIN &&
                        (member.role === ProjectRole.OWNER ||
                          member.role === ProjectRole.ADMIN)) ||
                      member.role === ProjectRole.OWNER
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
