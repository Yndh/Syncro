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
  Tasks: any[];
  members: any[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const Project = ({ params }: ProjectParams) => {
  const [project, setProject] = useState<Project | undefined>();
  const [selectedTab, setSelectedTab] = useState<
    "tasks" | "notes" | "members" | "settings"
  >("tasks");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/project/${params.id}`);
        const data = await res.json();

        if (data.error) {
          alert(data.error);
          router.push("/app/projects");
        } else {
          setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleNavChange = (tab: "tasks" | "notes" | "members" | "settings") => {
    setSelectedTab(tab);
  };

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
        {selectedTab === "tasks" && <ToDo />}
        {selectedTab === "notes" && <p>Notes</p>}
        {selectedTab === "members" && <p>Members</p>}
        {selectedTab === "settings" && <p>Settings</p>}
      </div>
    </>
  );
};

export default Project;
