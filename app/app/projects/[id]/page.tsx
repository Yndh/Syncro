"use client";

import ToDo from "@/app/components/todo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project, ProjectRole } from "@/app/types/interfaces";
import { MembersList } from "@/app/components/MembersList";
import { Notes } from "@/app/components/Notes";
import { Settings } from "@/app/components/Settings";

interface ProjectParams {
  params: {
    id: string;
  };
}

const ProjectPage = ({ params }: ProjectParams) => {
  const [project, setProject] = useState<Project | undefined>();
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [membershipId, setMembershipId] = useState<number>();
  const [selectedTab, setSelectedTab] = useState<
    "tasks" | "notes" | "members" | "settings"
  >("tasks");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch(`/api/project/${params.id}`)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);

            if (data.error) {
              alert(data.error);
              router.push("/app/projects");
            } else {
              setProject(data.project);
              setRole(data.role);
              setMembershipId(data.membershipId);
            }
          });
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleNavChange = (tab: "tasks" | "notes" | "members" | "settings") => {
    setSelectedTab(tab);
  };

  console.log("===PROJECT===");
  console.log(project);

  return (
    <>
      <h1>
        {project?.name} [id{params.id}]
      </h1>
      <p>{project?.description}</p>

      <div className="projectNav">
        <div className="navElement">
          <input
            type="radio"
            id="tasks"
            name="projectNav"
            checked={selectedTab === "tasks"}
            onChange={() => handleNavChange("tasks")}
          />
          <label htmlFor="tasks">Tasks</label>
        </div>
        <div className="navElement">
          <input
            type="radio"
            id="notes"
            name="projectNav"
            checked={selectedTab === "notes"}
            onChange={() => handleNavChange("notes")}
          />
          <label htmlFor="notes">Notes</label>
        </div>
        <div className="navElement">
          <input
            type="radio"
            id="members"
            name="projectNav"
            checked={selectedTab === "members"}
            onChange={() => handleNavChange("members")}
          />
          <label htmlFor="members">Members</label>
        </div>
        <div className="navElement">
          <input
            type="radio"
            id="settings"
            name="projectNav"
            checked={selectedTab === "settings"}
            onChange={() => handleNavChange("settings")}
          />
          <label htmlFor="settings">Settings</label>
        </div>
      </div>

      <div className="projectElementContainer">
        {selectedTab === "tasks" && project && (
          <ToDo
            projectId={project?.id as number}
            isAdmin={role === "OWNER" || role === "ADMIN"}
            project={project}
          />
        )}
        {selectedTab === "notes" && project && (
          <Notes
            isAdmin={role === "OWNER" || role === "ADMIN"}
            projectId={project?.id as number}
            project={project}
          />
        )}
        {selectedTab === "members" && project && role && (
          <MembersList
            projectId={project.id}
            members={project?.members}
            role={role}
            setProject={setProject}
          />
        )}
        {selectedTab === "settings" && project && membershipId && (
          <Settings
            role={role}
            membershipId={membershipId}
            projectId={project.id}
            project={project}
          />
        )}
      </div>
    </>
  );
};

export default ProjectPage;
