"use client";

import ToDo from "@/app/components/todo";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Invite, Project, ProjectRole } from "@/app/types/interfaces";
import { MembersList } from "@/app/components/MembersList";
import { Notes } from "@/app/components/Notes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faListCheck,
  faNoteSticky,
  faPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useProjects } from "@/app/providers/ProjectsProvider";
import { useModal } from "@/app/providers/ModalProvider";
import { InviteDetails } from "@/app/components/inviteDetails";
import { toast } from "react-toastify";
import { useContextMenu } from "@/app/providers/ContextMenuProvider";
import Link from "next/link";
import Image from "next/image";

interface ProjectParams {
  params: {
    id: string;
  };
}

const ProjectPage = ({ params }: ProjectParams) => {
  const { projects, getProjectById } = useProjects();
  const { setModal } = useModal();
  const { setContextMenu } = useContextMenu();
  const { fetchProjects } = useProjects();
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [membershipId, setMembershipId] = useState<number>();
  const [selectedTab, setSelectedTab] = useState<
    "tasks" | "notes" | "members" | "settings"
  >("tasks");
  const router = useRouter();
  const [project, setProject] = useState<Project>();
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const projectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const newProjectNameInputRef = useRef<HTMLInputElement>(null);
  const newProjectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin: boolean = role === "OWNER" || role === "ADMIN";

  useEffect(() => {
    const localProject = getProjectById(parseInt(params.id));
    setProject(localProject);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch(`/api/project/${params.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              alert(
                "Uh-oh! We couldn’t grab the project details. How about a quick refresh?"
              );
              router.push("/app");
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

  const isExpired = (invite: Invite) => {
    const now = new Date();
    return invite.expires && new Date(invite.expires) < now;
  };

  const nonExpiredInvites = project?.projectInvitations
    ? project.projectInvitations.filter(
        (invite) => invite && !isExpired(invite)
      )
    : [];

  const openSettings = () => {
    setModal({
      title: "Settings",
      content: (
        <form onSubmit={updateProject} id="settingsForm">
          <div className="formRow">
            <label htmlFor="projectName">
              <p>Name</p>
              <span>Enter the name of your project</span>
            </label>

            <input
              type="text"
              placeholder="Project name..."
              ref={projectNameInputRef}
              defaultValue={project?.name}
              id="projectName"
            />
          </div>

          <div className="formRow">
            <label htmlFor="projectDescription">
              <p>Description</p>
              <span>Provide a brief overview of your project</span>
            </label>

            <textarea
              disabled={!(role === "ADMIN" || role === "OWNER")}
              placeholder="Project name..."
              ref={projectDescriptionTextAreaRef}
              defaultValue={project?.description}
              id="projectDescription"
            />
          </div>

          {(role === "ADMIN" || role === "OWNER") && (
            <div className="formRow">
              <label htmlFor="projectDescription">
                <p>Invites</p>
                <span>Manage project invitatuibs</span>
              </label>

              <div className="invites">
                {nonExpiredInvites ? (
                  nonExpiredInvites.length > 0 ? (
                    nonExpiredInvites.map((invite) => (
                      <InviteDetails
                        invite={invite}
                        key={invite.id}
                        setProject={setProject}
                      />
                    ))
                  ) : (
                    <p className="noInvites">There is no active invites</p>
                  )
                ) : (
                  <p className="noInvites">There is no active invites</p>
                )}
              </div>
            </div>
          )}

          {role === "OWNER" ? (
            <div className="formRow action">
              <label htmlFor="projectDescription">
                <p>Delete</p>
                <span>Permanently remove the project</span>
              </label>

              <button className="projectLeave" onClick={deleteProjectModal}>
                Delete Project
              </button>
            </div>
          ) : (
            <div className="formRow">
              <label htmlFor="projectDescription">
                <p>Leave</p>
                <span>Withdraw from the project</span>
              </label>

              <button
                className="projectLeave"
                onClick={() => {
                  project && leaveProjectModal(project?.id);
                }}
              >
                Leave Project
              </button>
            </div>
          )}
        </form>
      ),
      bottom: (
        <>
          {(role === "ADMIN" || role === "OWNER") && (
            <button type="submit" form="settingsForm">
              Save changes
            </button>
          )}
          <button className="secondary" onClick={() => setModal(null)}>
            Close
          </button>
        </>
      ),
      setModal,
    });
  };

  const updateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (projectNameInputRef.current?.value as string).trim();

    if (name === "") {
      toast.warn("Hold on! A project needs a name. What should we call it?");
      return;
    }
    if (name.length > 100) {
      toast.warn(
        "Heads up! The project name is a bit too lengthy. Try shortening it to keep things concise!"
      );
      return;
    }
    const description = (
      projectDescriptionTextAreaRef.current?.value as string
    ).trim();
    if (description.length > 400) {
      toast.warn(
        "Warning! The project description is getting too wordy. Let's trim it down a bit!"
      );
      return;
    }

    setModal(null);

    await fetch(`/api/project/${project?.id}`, {
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
          return;
        }

        if (data.project) {
          setProject(data.project);
          toast.success("Success! Your project has been updated!");
          return;
        }
      });
  };

  const leaveProjectModal = (projectId: number) => {
    setModal({
      title: "Leave Project",
      content: (
        <div className="header">
          <h1>Confirm Departure</h1>
          <p>
            Are you sure you want to leave the project? You will lose access to
            all project resources and updates.
          </p>
        </div>
      ),
      bottom: (
        <>
          <button onClick={(e) => leaveProject(e, projectId)}>
            Leave Project
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const deleteProjectModal = () => {
    setModal({
      title: "Confirm Project Deletion",
      content: (
        <div className="header">
          <h1>Confirm Project Deletion</h1>
          <p>
            Are you sure you want to permanently delete this project? This
            action cannot be undone, and all associated data will be lost.
          </p>
        </div>
      ),
      bottom: (
        <>
          <button onClick={deleteProject}>Delete Project</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const leaveProject = async (
    e: React.MouseEvent<HTMLButtonElement>,
    projectId: number
  ) => {
    e.preventDefault();

    setModal(null);

    await fetch(`/api/project/${projectId}/members/${membershipId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(
            "Oops! Something went wrong while trying to leave the project. Give it another shot!"
          );
          return;
        }

        if (data.project) {
          router.push("/app");

          fetchProjects();
          toast.success(
            "You've successfully left the project! Onward to new endeavors!"
          );
        }
      });
  };

  const deleteProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setModal(null);

    await fetch(`/api/project/${project?.id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(
            "Uh-oh! The project didn't want to be deleted just yet. Try again!"
          );
          return;
        }

        if (data.success) {
          router.push("/app");
          toast.success(
            "Project deleted! Time to make room for new adventures!"
          );
        }
      });
  };

  const handleNavChange = (tab: "tasks" | "notes" | "members" | "settings") => {
    if (tab === "settings") {
      openSettings();
      return;
    }
    setSelectedTab(tab);
  };

  const completedTasksPercentage = project?.tasks?.length
    ? (
        (project.tasks.filter((task) => task.taskStatus === "DONE").length /
          project.tasks.length) *
        100
      ).toFixed(2)
    : "0.00";

  const handleContextMenu = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    projectId: number
  ) => {
    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      onClose: () => {
        setContextMenu(null);
      },
      content: (
        <ol className="contextMenuList">
          {isAdmin && <li onClick={openSettings}>Project Settings</li>}
          {role != "OWNER" && (
            <li onClick={() => leaveProjectModal(projectId)}>Leave</li>
          )}
        </ol>
      ),
      setContextMenu,
    });
  };

  const displayMembers = () => {
    if (!project) return;
    const MAX_NUM_OF_MEMBERS = 3;
    const remainingMembers = project?.members.length - MAX_NUM_OF_MEMBERS;

    return (
      <div className="projectMembers">
        {project.members.slice(0, MAX_NUM_OF_MEMBERS).map((member) => (
          <Image
            key={member.id}
            src={member.user.image}
            alt={member.user.name}
            className="memberAvatar"
            width={40}
            height={40}
          />
        ))}
        {remainingMembers > 0 && <span>+{remainingMembers}</span>}
      </div>
    );
  };

  const createProjectModal = () => {
    setModal({
      title: "Create Project",
      content: (
        <form onSubmit={createProject} id="createProjectForm">
          <div className="formRow">
            <label htmlFor="projectName">
              <p>Name</p>
              <span>Enter the name of your project</span>
            </label>

            <input
              type="text"
              placeholder="Project name..."
              ref={newProjectNameInputRef}
              id="projectName"
            />
          </div>

          <div className="formRow">
            <label htmlFor="projectDescription">
              <p>Description</p>
              <span>Provide a brief overview of your project</span>
            </label>

            <textarea
              placeholder="Project name..."
              ref={newProjectDescriptionTextAreaRef}
              id="projectDescription"
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="createProjectForm">
            Create Project
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const createProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (newProjectNameInputRef.current?.value as string).trim();
    if (name === "") {
      toast.warn("Hold on! A project needs a name. What should we call it?");
      return;
    }
    if (name.length > 100) {
      toast.warn(
        "Heads up! The project name is a bit too lengthy. Try shortening it to keep things concise!"
      );
      return;
    }

    const description = (
      newProjectDescriptionTextAreaRef.current?.value as string
    ).trim();
    if (description.length > 400) {
      toast.warn(
        "Warning! The project description is getting too wordy. Let's trim it down a bit!"
      );
      return;
    }

    setModal(null);

    await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(
            "Oops! Something went wrong while creating your project. Give it another try!"
          );
          return;
        }

        if (data.id) {
          router.push(`/app/projects/${data.id}`);
          fetchProjects();
          toast.success(
            "Congratulations! Your project has been created successfully!"
          );
        }
      });
  };

  return (
    <>
      <div className="projectPage">
        <div className="projectsList">
          <h2>Projects</h2>

          <div className="list">
            <p>All Projects ({projects ? projects.length : 0})</p>
            <ol>
              {projects &&
                projects.map((project) => (
                  <li key={`project${project.id}`}>
                    <span className="min"></span>
                    <Link
                      href={`/app/projects/${project.id}`}
                      className={
                        parseInt(params.id) === project.id ? "active" : ""
                      }
                      onContextMenu={(e) => {
                        handleContextMenu(e, project.id);
                      }}
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
            </ol>
            <button onClick={createProjectModal}>
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
              <progress value={completedTasksPercentage} max={100}>
                {" "}
              </progress>
              <p>{completedTasksPercentage}% Completed</p>
              {displayMembers()}
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
                isAdmin={isAdmin}
                tasks={project.tasks}
              />
            )}
            {selectedTab === "notes" && project && (
              <Notes
                isAdmin={isAdmin}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPage;
