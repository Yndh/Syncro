"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./taskColumn";
import { Project, Task, TaskStatus } from "../types/interfaces";
import NewTask from "./NewTask";
import { toast } from "react-toastify";
import React from "react";

interface ToDoProps {
  projectId?: string;
  tasks: Task[];
  isAdmin: boolean;
  showProject?: boolean;
  setProject?: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

const ToDo = ({
  projectId,
  isAdmin,
  tasks,
  showProject = false,
  setProject,
}: ToDoProps) => {
  const [tasksList, setTasksList] = useState<Task[]>(tasks);

  useEffect(() => {
    setTasksList(tasks);
  }, [tasks]);

  useEffect(() => {
    if (setProject && projectId) {
      setProject((prevProject) => {
        if (prevProject && prevProject.id === projectId) {
          return {
            ...prevProject,
            tasks: tasksList,
          };
        }
        return prevProject;
      });
    }
  }, [tasksList, projectId, setProject]);

  const moveTask = useCallback(
    async (task: Task, newStatus: TaskStatus) => {
      if (typeof tasksList != "object") return;

      const prevTasksList = [...tasksList];

      setTasksList((prevTasks) =>
        prevTasks.map((prevTask) =>
          prevTask.id === task.id
            ? { ...prevTask, taskStatus: newStatus }
            : prevTask
        )
      );

      try {
        const res = await fetch(
          `/api/project/${task.projectId}/task/${task.id}/status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              taskStatus: newStatus,
            }),
          }
        );
        const data = await res.json();

        if (data.error) {
          setTasksList(prevTasksList);
          toast.error(
            "Uh-oh! We couldn't move the task. It seems to have a mind of its own!"
          );
        } else if (data.task) {
          setTasksList((prevTasks) =>
            prevTasks.map((prevTask) =>
              prevTask.id === data.task.id
                ? { ...prevTask, taskStatus: data.task.taskStatus }
                : prevTask
            )
          );
        }
      } catch (error) {
        console.error("Error moving task:", error);
        setTasksList(prevTasksList);
        toast.error("Failed to move the task due to a network error.");
      }
    },
    [tasksList]
  );

  const filterTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return tasksList
        ? tasksList.filter((task) => task.taskStatus === status)
        : [];
    },
    [tasksList]
  );

  const todoTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.TO_DO),
    [filterTasksByStatus]
  );
  const onGoingTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.ON_GOING),
    [filterTasksByStatus]
  );
  const reviewingTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.REVIEWING),
    [filterTasksByStatus]
  );
  const doneTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.DONE),
    [filterTasksByStatus]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todoContainer">
        <TaskColumn
          status={TaskStatus.TO_DO}
          tasks={todoTasks}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.ON_GOING}
          tasks={onGoingTasks}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.REVIEWING}
          tasks={reviewingTasks}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={doneTasks}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />

        {isAdmin && projectId && (
          <NewTask
            projectId={projectId}
            setTasksList={setTasksList}
            tasksList={tasksList}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default React.memo(ToDo);
