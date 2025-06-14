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

interface Projects {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  fetchProjects: () => void;
  getProjectById: (id: number) => Project | undefined;
}

const ProjectsContext = createContext<Projects | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectsContext);

  if (!context)
    throw new Error("useProjects must be used within ProjectsProvider");
  return context;
};

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider = ({ children }: ProjectsProviderProps) => {
  const [projects, setProjectsState] = useState<Project[]>([]);

  const setProjects = useCallback((projects: Project[]) => {
    setProjectsState(projects);
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
        console.error(data.error);
      } else if (data.projects) {
        setProjectsState(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  const getProjectById = useCallback(
    (id: number): Project | undefined => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  useEffect(() => {
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
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};
