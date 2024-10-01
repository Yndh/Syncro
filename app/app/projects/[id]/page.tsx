"use client";

import ToDo from "@/app/components/todo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project, ProjectRole } from "@/app/types/interfaces";
import { MembersList } from "@/app/components/MembersList";
import { Notes } from "@/app/components/Notes";
import { Settings } from "@/app/components/Settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faList,
  faListCheck,
  faNoteSticky,
  faPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useProjects } from "@/app/providers/ProjectsProvider";

interface ProjectParams {
  params: {
    id: string;
  };
}

const ProjectPage = ({ params }: ProjectParams) => {
  const { projects, getProjectById } = useProjects();

  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [membershipId, setMembershipId] = useState<number>();
  const [selectedTab, setSelectedTab] = useState<
    "tasks" | "notes" | "members" | "settings"
  >("tasks");
  const router = useRouter();
  const [project, setProject] = useState<Project>();

  useEffect(() => {
    const localProject = getProjectById(parseInt(params.id));
    setProject(localProject);
    console.log(`id ${parseInt(params.id)}`);
    console.log(`Got project lol => ${project}`);
    console.log(projects);

    console.log(
      `Filter => ${projects.find(
        (project) => project.id === parseInt(params.id)
      )}`
    );
  }, [projects]);

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

  return (
    <>
      <div className="projectPage">
        <div className="projectsList">
          <h2>Projects</h2>

          <div className="list">
            <p>All Projects ({projects.length})</p>
            <ol>
              {projects.map((project) => (
                <li key={`project${project.id}`}>
                  <span className="min"></span>
                  <a
                    href={`/app/projects/${project.id}`}
                    className={
                      parseInt(params.id) === project.id ? "active" : ""
                    }
                  >
                    {project.name}
                  </a>
                </li>
              ))}
            </ol>
            <button>
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Project</span>
            </button>
          </div>
        </div>
        <div className="projectContainer">
          <div className="header">
            <h2>
              {project?.name} [id{params.id}]
            </h2>
            <p>{project?.description}</p>
            <div className="percentage">
              <progress value={72} max={100}>
                {" "}
              </progress>
              <p>72% completed</p>
            </div>
          </div>

          <div className="projectNav">
            <div className="navElement">
              <input
                type="radio"
                id="tasks"
                name="projectNav"
                checked={selectedTab === "tasks"}
                onChange={() => handleNavChange("tasks")}
              />
              <label htmlFor="tasks">
                <FontAwesomeIcon icon={faListCheck} />
                Tasks
              </label>
            </div>
            <div className="navElement">
              <input
                type="radio"
                id="notes"
                name="projectNav"
                checked={selectedTab === "notes"}
                onChange={() => handleNavChange("notes")}
              />
              <label htmlFor="notes">
                <FontAwesomeIcon icon={faNoteSticky} />
                Notes
              </label>
            </div>
            <div className="navElement">
              <input
                type="radio"
                id="members"
                name="projectNav"
                checked={selectedTab === "members"}
                onChange={() => handleNavChange("members")}
              />
              <label htmlFor="members">
                <FontAwesomeIcon icon={faUsers} />
                Members
              </label>
            </div>
            <div className="navElement">
              <input
                type="radio"
                id="settings"
                name="projectNav"
                checked={selectedTab === "settings"}
                onChange={() => handleNavChange("settings")}
              />
              <label htmlFor="settings">
                <FontAwesomeIcon icon={faCog} />
                Settings
              </label>
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
                project={project}
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
                setProject={setProject}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPage;
