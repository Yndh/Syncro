"use client";

import {
  createContext,
  ReactNode,
  useCallback,
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

  const fetchData = useCallback(async () => {
    try {
      await fetch("/api/user/tasks", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            if (data.tasks) {
              setTasksState(data.tasks);
            }
          }
        });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setTasks = useCallback((tasks: Task[]) => {
    setTasksState(tasks);
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TasksContext.Provider>
  );
};
