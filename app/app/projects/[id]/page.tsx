"use client";

import ToDo from "@/app/components/todo";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Invite, Project, ProjectRole } from "@/app/types/interfaces";
import { MembersList } from "@/app/components/MembersList";
import { Notes } from "@/app/components/Notes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faClose,
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
import { Skeleton } from "@/app/components/Skeleton";
import { useSession } from "next-auth/react";

interface ProjectParams {
  params: {
    id: string;
  };
}

const isInviteExpired = (invite: Invite) => {
  const now = new Date();
  return invite.expires && new Date(invite.expires) < now;
};

const getCompletedTasksPercentage = (project: Project): string => {
  if (!project?.tasks?.length) return "0.00";
  const completed = project.tasks.filter(
    (task) => task.taskStatus === "DONE"
  ).length;
  return ((completed / project.tasks.length) * 100).toFixed(2);
};

const getNonExpiredInvites = (project: Project): Invite[] => {
  return project?.projectInvitations
    ? project.projectInvitations.filter(
        (invite) => invite && !isInviteExpired(invite)
      )
    : [];
};

const ProjectPage = ({ params }: ProjectParams) => {
  const { projects, getProjectById, setProjectById } = useProjects();
  const { setModal } = useModal();
  const { setContextMenu } = useContextMenu();
  const { fetchProjects } = useProjects();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      toast.warning("Please sign in");
      router.replace("/signIn");
    },
  });

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [membershipId, setMembershipId] = useState<number | undefined>(
    undefined
  );
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);

  const [selectedTab, setSelectedTab] = useState<
    "tasks" | "notes" | "members" | "settings"
  >("tasks");
  const [isLoading, setIsLoading] = useState(true);

  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const projectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const newProjectNameInputRef = useRef<HTMLInputElement>(null);
  const newProjectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin: boolean = useMemo(() => {
    return role === ProjectRole.OWNER || role === ProjectRole.ADMIN;
  }, [role]);

  const fetchProjectData = useCallback(async () => {
    try {
      await fetch(`/api/project/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(
              "Uh-oh! We couldn’t grab the project details. How about a quick refresh?"
            );
            router.push("/app");
          } else {
            setIsLoading(false);
            setProject(data.project);
            setRole(data.role);
            setMembershipId(data.membershipId);
          }
        });
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!isLoading) return;
    const cachedProject = getProjectById(params.id);
    if (cachedProject) {
      setProject(cachedProject);
      setIsLoading(false);
    }
  }, [projects, getProjectById, isLoading, params.id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    const savedProject = getProjectById(params.id);
    if (!project || !savedProject) return;

    const hasChanged = JSON.stringify(project) !== JSON.stringify(savedProject);

    if (hasChanged) {
      console.log("saving project", project.id);
      setProjectById(params.id, project);
    }
  }, [project, params.id, setProjectById, getProjectById]);

  useEffect(() => {
    if (project?.name) {
      document.title = `${project.name} | Syncro`;
    } else {
      document.title = "Loading Project... | Syncro";
    }
  }, [project]);

  const leaveProject = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
      e.preventDefault();

      setModal(null);

      await fetch(`/api/project/${projectId}/members/${membershipId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
    },
    [membershipId, router, fetchProjects, setModal]
  );

  const deleteProject = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      setModal(null);

      await fetch(`/api/project/${project?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
    },
    [project?.id, router, setModal]
  );

  const updateProject = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
        headers: {
          "Content-Type": "application/json",
        },
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
    },
    [project?.id, setModal]
  );

  const createProject = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
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
    },
    [router, fetchProjects, setModal]
  );

  const openSettings = () => {
    const nonExpiredInvites = project ? getNonExpiredInvites(project) : [];

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
              disabled={
                !(role === ProjectRole.ADMIN || role === ProjectRole.OWNER)
              }
              placeholder="Project name..."
              ref={projectDescriptionTextAreaRef}
              defaultValue={project?.description}
              id="projectDescription"
            />
          </div>

          {(role === ProjectRole.ADMIN || role === ProjectRole.OWNER) && (
            <div className="formRow">
              <label htmlFor="projectDescription">
                <p>Invites</p>
                <span>Manage project invitations</span>
              </label>

              <div className="invites">
                {nonExpiredInvites.length > 0 ? (
                  nonExpiredInvites.map((invite) => (
                    <InviteDetails
                      invite={invite}
                      key={invite.id}
                      setProject={setProject}
                    />
                  ))
                ) : (
                  <p className="noInvites">There are no active invites.</p>
                )}
              </div>
            </div>
          )}

          {role === ProjectRole.OWNER ? (
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
          {(role === ProjectRole.ADMIN || role === ProjectRole.OWNER) && (
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

  const leaveProjectModal = (projectId: string) => {
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

  const handleNavChange = (tab: "tasks" | "notes" | "members" | "settings") => {
    if (tab === "settings") {
      openSettings();
      return;
    }
    setSelectedTab(tab);
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    projectId: string
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
          {isAdmin && projectId == project?.id && (
            <li onClick={openSettings}>Project Settings</li>
          )}
          {role !== ProjectRole.OWNER && (
            <li onClick={() => leaveProjectModal(projectId)}>Leave</li>
          )}
        </ol>
      ),
    });
  };

  const displayMembers = () => {
    if (!project || !project?.members || !project.members.length) return;
    const MAX_NUM_OF_MEMBERS = 2;
    const remainingMembers = project?.members.length - MAX_NUM_OF_MEMBERS;

    return (
      <div className="projectMembers">
        {project.members.slice(0, MAX_NUM_OF_MEMBERS).map((member) => (
          <div className="avatar" key={member.id}>
            <Image
              src={member.user.image}
              alt={member.user.name}
              className="memberAvatar"
              width={40}
              height={40}
            />

            <p>{member.user.name}</p>
          </div>
        ))}
        {remainingMembers > 0 && (
          <div className="avatar bg">
            <span>+{remainingMembers}</span>
          </div>
        )}
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

  return (
    <>
      <div className="projectPage">
        <input type="checkbox" id="projectMenuCheckbox" />
        <label
          htmlFor="projectMenuCheckbox"
          className="projectMenuCheckboxLabel"
        >
          <FontAwesomeIcon icon={faBars} className="bars" />
          <FontAwesomeIcon icon={faClose} className="xmark" />
        </label>
        <div className="projectsList">
          <h2>Projects</h2>

          <div className="list">
            <p>
              All Projects (
              {projects ? (
                projects.length
              ) : (
                <Skeleton size="small" width="text" />
              )}
              )
            </p>
            <ol>
              {projects ? (
                projects.map((project) => (
                  <li key={`project${project.id}`}>
                    <span className="min"></span>
                    <Link
                      href={`/app/projects/${project.id}`}
                      className={params.id === project.id ? "active" : ""}
                      onContextMenu={(e) => {
                        handleContextMenu(e, project.id);
                      }}
                    >
                      {project.name}
                    </Link>
                  </li>
                ))
              ) : (
                <Skeleton width="full" size="medium" />
              )}
            </ol>
            <button onClick={createProjectModal}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Project</span>
            </button>
          </div>
        </div>
        <div className="projectContainer">
          <div className="header">
            {project ? (
              <>
                <h2>{project?.name}</h2>
                <p>{project?.description}</p>
                <div className="percentage">
                  <progress
                    value={project ? getCompletedTasksPercentage(project) : 0}
                    max={100}
                  >
                    {" "}
                  </progress>
                  <p>
                    {project ? getCompletedTasksPercentage(project) : 0}%
                    Completed
                  </p>
                  {displayMembers()}
                </div>
              </>
            ) : (
              <>
                <Skeleton size="large" />
                <Skeleton width="quarter" />
                <Skeleton size="medium" />
              </>
            )}
          </div>

          {project ? (
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
                  <span>Tasks</span>
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
                  <span>Notes</span>
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
                  <span>Members</span>
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
                  <span>Settings</span>
                </label>
              </div>
            </div>
          ) : (
            <Skeleton size="large" />
          )}

          <div className="projectElementContainer">
            {project ? (
              <>
                {selectedTab === "tasks" && project && (
                  <ToDo
                    projectId={project?.id as string}
                    isAdmin={isAdmin}
                    tasks={project.tasks}
                    setProject={setProject}
                  />
                )}
                {selectedTab === "notes" && project && (
                  <Notes
                    isAdmin={isAdmin}
                    projectId={project?.id as string}
                    project={project}
                    setProject={setProject}
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
              </>
            ) : (
              <Skeleton size="full" width="full" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPage;
