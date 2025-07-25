"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faCog,
  faDiagramProject,
  faList,
  faMoon,
  faRightFromBracket,
  faSun,
  faTable,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { useProjects } from "../providers/ProjectsProvider";
import { useModal } from "../providers/ModalProvider";
import getUrl from "@/lib/getUrl";
import { toast } from "react-toastify";
import Select from "./Select";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers/ThemeProvider";
import { signOut } from "next-auth/react";

const providersOptions = [
  {
    value: "Google",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faGoogle as IconProp} />
        <span>Google</span>
      </div>
    ),
  },
  {
    value: "Github",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faGithub as IconProp} />
        <span>Github</span>
      </div>
    ),
  },
];

const themeOptions = [
  {
    value: "light",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faSun} />
        <span>Light</span>
      </div>
    ),
  },
  {
    value: "dark",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faMoon} />
        <span>Dark</span>
      </div>
    ),
  },
];

const Sidebar = () => {
  const [projectId, setProjectId] = useState<string | boolean>(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const projectDescriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const deleteUsernameInput = useRef<HTMLInputElement>(null);
  const deleteVerifyInput = useRef<HTMLInputElement>(null);
  const { projects, fetchProjects } = useProjects();
  const { setModal } = useModal();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, update } = useSession({
    required: true,
  });

  useEffect(() => {
    if (projects != null && projects.length > 0) {
      setProjectId(projects[0].id);
    } else if (projects == null) {
      setProjectId(false);
    }
  }, [projects]);

  const projectModal = () => {
    if (projectId) return;

    setModal({
      title: "",
      content: (
        <>
          <div className="header">
            <h2>Join or Create a Project</h2>
            <p>
              Select an option below to either join an existing project or
              create a new one. Collaborate and make an impact!
            </p>
          </div>
          <div className="createOrJoin">
            <button onClick={createProjectModal}>Create Project</button>

            <span className="or">or</span>

            <button onClick={joinProjectModal}>Join Project</button>
          </div>
        </>
      ),
      bottom: (
        <>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
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
              ref={projectNameInputRef}
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
              ref={projectDescriptionTextAreaRef}
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

  const joinProjectModal = () => {
    setModal({
      title: "Join Project",
      content: (
        <form onSubmit={joinProject} id="joinProjectForm">
          <div className="formRow">
            <label htmlFor="projectInviteUrl">
              <p>Invite</p>
              <span>Enter the invite URL or code</span>
            </label>

            <input
              type="text"
              placeholder={`${getUrl()}/join/ABC123`}
              ref={inviteInputRef}
              id="projectInviteUrl"
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="joinProjectForm">
            Join
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

  const joinProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const inviteUrl = inviteInputRef.current?.value as string;
    const codeMatch = inviteUrl.match(/invite\/([^/]+)/);
    const code = codeMatch ? codeMatch[1] : inviteUrl.trim();

    if (!code) {
      toast.warn(
        "Oops! That invite schema is invalid. Please check the format and try again!"
      );
      return;
    }

    setModal(null);

    try {
      await fetch(`/api/invite/${code}/join`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(
              "Uh-oh! We couldn't complete your request to join the project. Please try again!"
            );
            return;
          }

          if (data.projectId) {
            router.push(`/app/projects/${data.projectId}`);
            fetchProjects();
            toast.success(
              "Hooray! You've successfully joined the project! Let's get started!"
            );
          }
        });
    } catch (e) {
      console.error(`Error joining project: ${e}`);
    }
  };

  const handleUserModal = () => {
    setModal({
      title: "User",
      content: (
        <form onSubmit={updateUser} id="userForm">
          <div className="formRow">
            <label htmlFor="userNameInput">
              <p>Username</p>
              <span>Name of account</span>
            </label>

            <input
              type="text"
              defaultValue={session?.user?.name as string}
              id="userNameInput"
              ref={usernameInputRef}
            />
          </div>
          <div className="formRow">
            <label>
              <p>Email</p>
              <span>Email linked to your account</span>
            </label>

            <input
              type="text"
              defaultValue={session?.user?.email as string}
              disabled={true}
            />
          </div>
          {session && session?.user.provider && (
            <div className="formRow">
              <label>
                <p>Provider</p>
                <span>Your auth provider</span>
              </label>

              <Select
                disabled={true}
                options={providersOptions}
                selectedOption={providersOptions.find(
                  (option) =>
                    option.value.toLowerCase() ===
                    session?.user.provider?.toLowerCase()
                )}
                onChange={() => {}}
              />
            </div>
          )}

          <div className="formRow">
            <label>
              <p>Logout</p>
              <span>Sign out of your account</span>
            </label>

            <button onClick={logoutModal} className="signOut">
              Logout
            </button>
          </div>

          <div className="formRow">
            <label>
              <p>Delete</p>
              <span>Permanently delete your account</span>
            </label>

            <button onClick={deleteModal} className="signOut">
              Delete
            </button>
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="userForm">
            Save Changes
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const logoutModal = () => {
    setModal({
      title: "Logout",
      content: (
        <div className="header">
          <h1> Are you sure you want to log out?</h1>
          <p>
            This action will end your session, and you will need to sign in
            again to access your account.
          </p>
        </div>
      ),
      bottom: (
        <>
          <button onClick={() => signOut()}>Logout</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const updateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = (usernameInputRef.current?.value as string).trim();
    if (username == "") {
      toast.warn("Oops! The username cannot be empty. Please enter a new one!");
      return;
    }
    if (username.length > 39) {
      toast.warn("Heads up! The username is too lengthy. Try a shorter name!");
      return;
    }

    setModal(null);

    try {
      await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({
          username: username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(
              "Uh-oh! We couldn't update your profile. Please try again!"
            );
            return;
          }

          if (data.success) {
            toast.success("Success! Your profile has been updated!");
            update();
          }
        });
    } catch (err) {
      toast.error("Uh-oh! We couldn't update your profile. Please try again!");
    }
  };

  const deleteModal = () => {
    setModal({
      title: "Delete",
      content: (
        <>
          <div className="header">
            <h1> Are you sure you want to delete your account?</h1>
            <p>
              This action is permanent and cannot be undone. All your data will
              be deleted, and you will no longer have access to your account.
            </p>
          </div>

          <div className="contentCol">
            <label htmlFor="userNameInputDelete">
              Enter username <b>{session?.user.name}</b> to continue:
            </label>
            <input
              type="text"
              id="userNameInputDelete"
              autoComplete="off"
              ref={deleteUsernameInput}
            />

            <label htmlFor="verifyInputDelete">
              To verify, type <b>delete my account</b> below:
            </label>
            <input
              type="text"
              autoComplete="off"
              id="verifyInputDelete"
              ref={deleteVerifyInput}
            />
          </div>
        </>
      ),
      bottom: (
        <>
          <button onClick={deleteAccount}>Delete</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const deleteAccount = async () => {
    const nameValue = (deleteUsernameInput.current?.value as string).trim();
    const userName = (session?.user.name as string).trim();

    if (nameValue !== userName) {
      toast.error("Oops! Looks like you forgot your own name. Try again!");
      return;
    }

    const verifyValue = (deleteVerifyInput.current?.value as string).trim();

    if (verifyValue.toLowerCase() !== "delete my account") {
      toast.error(
        "Whoops! You didn't say the magic words. Hint: it's 'delete my account'."
      );
      return;
    }

    try {
      await fetch("/api/user", {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(
              "Oh no! Something went wrong. Your account is still safe and sound!"
            );
          }
          if (data.success) {
            toast.success(
              "Goodbye! Your account is officially on an endless vacation"
            );
            setModal(null);
            window.location.reload();
          }
        });
    } catch (err) {
      toast.error(
        "Uh-oh! It looks like our digital hamster ran off with your request! Please try again later"
      );
    }
  };

  const handleSettingsModal = () => {
    setModal({
      title: "Settings",
      content: (
        <form onSubmit={updateUser} id="userForm">
          <div className="formRow">
            <label htmlFor="userNameInput">
              <p>Theme</p>
              <span>
                Choose your preferred theme to personalize your experience!
              </span>
            </label>

            <Select
              options={themeOptions}
              selectedOption={themeOptions.find(
                (option) => option.value.toLowerCase() == theme.toLowerCase()
              )}
              onChange={(option) => updateTheme(option)}
            />
          </div>
        </form>
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
  };

  const updateTheme = (option: any) => {
    setTheme(option.value);
  };

  return (
    <div className="sidebar">
      <Link className="logo" href={"/app"}>
        <Image src="/logo.svg" alt="Logo" width={35} height={35} />
        <h1>Syncro</h1>
      </Link>

      <nav>
        <p>Navigation</p>
        <ol>
          <li className={pathname == "/app" ? "active" : ""}>
            <Link href={"/app"}>
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faTable} />
                </div>
                <span>Dashboard</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
          <li className={pathname.startsWith("/app/projects") ? "active" : ""}>
            <Link
              href={projectId ? `/app/projects/${projectId}` : ""}
              onClick={projectModal}
            >
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faDiagramProject} />
                </div>
                <span>Projects</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
          <li className={pathname == "/app/tasks" ? "active" : ""}>
            <Link href={"/app/tasks"}>
              <div className={"navElement"}>
                <div className="icon">
                  <FontAwesomeIcon icon={faList} />
                </div>
                <span>My Tasks</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Link>
          </li>
        </ol>
        <p>Other</p>
        <ol>
          <li onClick={handleUserModal}>
            <div className={"navElement"}>
              <div className="icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <span>User</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </li>
          <li onClick={handleSettingsModal}>
            <div className={"navElement"}>
              <div className="icon">
                <FontAwesomeIcon icon={faCog} />
              </div>
              <span>Settings</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </li>
        </ol>
      </nav>

      <div className="userContainer">
        <div className="user">
          {session?.user ? (
            <div className="user">
              <Image
                src={session?.user.image as string}
                alt="Profile Image"
                width={40}
                height={40}
              />
              <div className="userDetails">
                <p>{session?.user.name as string}</p>
                <span>{session?.user.email as string}</span>
              </div>
              <div className="logoutBtnContainer">
                <button onClick={logoutModal}>
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </button>
              </div>
            </div>
          ) : (
            <p>There was an error while loading session</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
