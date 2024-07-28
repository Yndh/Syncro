"use client";

import { Invite, Project, ProjectRole } from "../types/interfaces";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface SettingsProps {
  role: ProjectRole;
  projectId: number;
  project: Project;
  membershipId: number;
  setProject: Dispatch<SetStateAction<Project | undefined>>;
}

export const Settings = ({
  role,
  projectId,
  project,
  membershipId,
  setProject,
}: SettingsProps) => {
  const [displayInvites, setDisplayInvites] = useState<boolean>(false);
  const [displayProjectDetails, setDisplayProjectDetails] =
    useState<boolean>(false);
  const projectNameInput = useRef<HTMLInputElement>(null);
  const descriptionInpuut = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const leaveProject = async () => {
    await fetch(`/api/project/${projectId}/members/${membershipId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.project) {
          router.push("/app/projects");
        }
      });
  };

  const deleteInvite = async (invite: Invite) => {
    if (
      window.confirm(`Do you really want to delete invite ${invite.linkId}?`)
    ) {

      await fetch(`/api/invite/${invite.linkId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
            return;
          }

          if (data.project) {
            alert("ok");
            setProject(data.project);
          }
        });
    }
  };

  const handleUpdateProject = async () => {
    const name = projectNameInput.current?.value as string;
    if (name.trim() === "") {
      alert("Project name cannot be empty");
      return;
    }

    const description = descriptionInpuut.current?.value as string;
    
    const prevProject = project

    setProject({...project, name, description})


    await fetch(`/api/project/${projectId}`, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        description: description,
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
          return;
        }
      });
  };

  const toggleDisplayInvites = () => {
    setDisplayInvites(!displayInvites);
  };

  const toggleDisplayProjectDetails = () => {
    setDisplayProjectDetails(!displayProjectDetails);
  };

  const isExpired = (invite: Invite) => {
    if (!invite.expires) return false;
    const currentDate = new Date();
    return new Date(invite.expires) < currentDate;
  };

  const nonExpiredInvites = project.projectInvitations.filter(
    (invite) => !isExpired(invite)
  );

  return (
    <div className="settingsContainer">
      <h2>Settings</h2>

      {(role == "ADMIN" || role == "OWNER") && (
        <>
          <p
            style={{ marginBottom: 5, marginTop: 10 }}
            onClick={toggleDisplayProjectDetails}
          >
            Details{" "}
            <FontAwesomeIcon
              icon={displayProjectDetails ? faChevronUp : faChevronDown}
            />
          </p>

          <div
            className={`projectDetails ${displayProjectDetails && "active"}`}
          >
            <label htmlFor="projectNameInput">Project name</label>
            <input
              type="text"
              defaultValue={project.name}
              id="projectNameInput"
              ref={projectNameInput}
            />

            <label htmlFor="projectDescInput">Project description</label>
            <input
              type="text"
              defaultValue={project.description}
              id="projectDescInput"
              ref={descriptionInpuut}
            />

            <button onClick={handleUpdateProject}>Save</button>
          </div>

          <p
            style={{ marginBottom: 5, marginTop: 10 }}
            onClick={toggleDisplayInvites}
          >
            Invites{" "}
            <FontAwesomeIcon
              icon={displayInvites ? faChevronUp : faChevronDown}
            />
          </p>
          <ul className={`inviteList ${displayInvites && "active"}`}>
            {nonExpiredInvites.map((invite) => (
              <li key={invite.id}>
                <Image
                  src={invite.createdBy.image}
                  alt={invite.createdBy.name}
                  width={30}
                  height={30}
                />
                <span>kod: {invite.linkId}</span>
                <span>użyc: {invite.uses}</span>
                <span>max uzyc: {invite.maxUses ? invite.maxUses : "∞"}</span>
                <span>wygasa: {invite.expires ? invite.expires : "∞"}</span>
                <button onClick={() => deleteInvite(invite)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {role == "OWNER" ? (
        <button>Delete Project</button>
      ) : (
        <button onClick={leaveProject}>Leave Project</button>
      )}
    </div>
  );
};
