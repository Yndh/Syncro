"use client";

import { auth } from "@/auth";
import { Project, ProjectRole } from "../types/interfaces";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SettingsProps {
  role: ProjectRole;
  projectId: number;
  membershipId: number;
}

export const Settings = ({ role, projectId, membershipId }: SettingsProps) => {
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
      {role == "OWNER" ? (
        <button>Delete Project</button>
      ) : (
        <button onClick={leaveProject}>Leave Project</button>
      )}
    </div>
  );
};
