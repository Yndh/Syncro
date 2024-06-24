"use client";

import ToDo from "@/app/components/todo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectParams {
  params: {
    id: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  owner: User;
  ownerId: string;
  Tasks: Task[];
  members: User[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueTime?: Date;
  projectId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  taskStatus: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  assignedTo: User[];
  createdAt: Date;
  updatedAt: Date;
}

const Project = ({ params }: ProjectParams) => {
  const [project, setProject] = useState<Project | undefined>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
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
              setIsOwner(data.owner);
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
            isOwner={isOwner}
            owner={project?.owner}
            members={project?.members}
            tasks={project?.Tasks ? project?.Tasks : []}
          />
        )}
        {selectedTab === "notes" && <p>Notes</p>}
        {selectedTab === "members" && <p>Members</p>}
        {selectedTab === "settings" && <p>Settings</p>}
      </div>
    </>
  );
};

export default Project;
