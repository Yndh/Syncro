"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Project } from "../types/interfaces";

interface Projects {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
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
  const [loading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const localProjects = localStorage.getItem("projects");
      if (!projects) {
        return;
      }
      setProjectsState(JSON.parse(localProjects!));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to get projects");
    }
  }, []);

  useEffect(() => {
    try {
      if (!loading) localStorage.setItem("projects", JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects");
    }
  }, [projects]);

  const setProjects = (projects: Project[]) => setProjectsState(projects);

  const addProject = (project: Project) =>
    setProjectsState((prevProjects) => [...prevProjects, project]);

  const getProjectById = (id: number): Project | undefined => {
    return projects.find((project) => project.id === id);
  };

  return (
    <ProjectsContext.Provider
      value={{ projects, setProjects, addProject, getProjectById }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};
