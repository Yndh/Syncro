"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Project } from "../types/interfaces";

interface ProjectsContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  fetchProjects: () => void;
  getProjectById: (id: string) => Project | undefined;
  setProjectById: (id: string, project: Project) => void;
  clearCache: () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined
);

export const useProjects = () => {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return context;
};

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider = ({ children }: ProjectsProviderProps) => {
  const [projects, setProjectsState] = useState<Project[]>([]);

  const setProjects = useCallback((newProjects: Project[]) => {
    setProjectsState(newProjects);
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjectsState((prevProjects) => [...prevProjects, project]);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "GET",
      });
      const data = await res.json();

      if (data.error) {
        console.error("API Error fetching projects:", data.error);
      } else if (data.projects) {
        setProjectsState(data.projects);
      }
    } catch (error) {
      console.error("Network Error fetching projects:", error);
    }
  }, []);

  const getProjectById = useCallback(
    (id: string): Project | undefined => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  const setProjectById = useCallback((id: string, updatedProject: Project) => {
    setProjectsState((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, ...updatedProject } : project
      )
    );
  }, []);

  const clearCache = useCallback(() => {
    try {
      setProjectsState([]);
      localStorage.removeItem("projects");
    } catch (err) {
      console.error(`Error clearing cache ${err}`);
    }
  }, []);

  useEffect(() => {
    try {
      if (projects.length > 0) {
        localStorage.setItem("projects", JSON.stringify(projects));
      } else {
        localStorage.removeItem("projects");
      }
    } catch (err) {
      console.error(`Error saving projects to local storage:`, err);
    }
  }, [projects]);

  useEffect(() => {
    try {
      const localProjectsString = localStorage.getItem("projects");
      if (localProjectsString) {
        const localProjects: Project[] = JSON.parse(localProjectsString);
        if (localProjects.length > 0) {
          setProjectsState(localProjects);
          console.log("Projects loaded from local storage:", localProjects);
        }
      }
    } catch (err) {
      console.error(`Error getting projects from local storage:`, err);
      localStorage.removeItem("projects");
    }

    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects,
        fetchProjects,
        addProject,
        getProjectById,
        setProjectById,
        clearCache,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};
