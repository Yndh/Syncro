"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Task } from "../types/interfaces";

interface Tasks {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const TasksContext = createContext<Tasks | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TasksContext);

  if (!context) throw new Error("useTasks must be used within TasksProvider");
  return context;
};

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [loading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const localProjects = localStorage.getItem("tasks");
      if (!localProjects) {
        return;
      }
      setTasksState(JSON.parse(localProjects!));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to get tasks");
    }
  }, []);

  useEffect(() => {
    try {
      if (!loading) localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks");
    }
  }, [tasks]);

  const setTasks = (tasks: Task[]) => setTasksState(tasks);

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TasksContext.Provider>
  );
};
