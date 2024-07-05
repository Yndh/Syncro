"use client";

import { auth } from "@/auth";
import { Project, ProjectRole } from "../types/interfaces";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SettingsProps {
  role: ProjectRole;
  projectId: number;
  project: Project;
  membershipId: number;
}

export const Settings = ({
  role,
  projectId,
  project,
  membershipId,
}: SettingsProps) => {
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

  return (
    <div className="settingsContainer">
      <h2>Settings</h2>

      {(role == "ADMIN" || role == "OWNER") && (
        <>
          <p style={{ marginBottom: 10 }}>Invites</p>
          <ul className="inviteList">
            {project.projectInvitations.map((invite) => (
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
