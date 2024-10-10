"use client";

import { useRef } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./taskCard";
import { Project, Task, TaskStatus, User } from "../types/interfaces";
import { toast } from "react-toastify";

interface DragItem {
  id: number;
  type: string;
}

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  project: Project;
  isAdmin: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  moveTask: (id: number, status: TaskStatus) => void;
}

export const TaskColumn = ({
  status,
  tasks,
  project,
  isAdmin,
  moveTask,
  setTasks,
}: TaskColumnProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item: DragItem) => moveTask(item.id, status),
    }),
    [status]
  );
  drop(divRef);

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm(`Do you really want to delete task id ${taskId}?`)) {
      try {
        await fetch(`/api/project/${project.id}/task/${taskId}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              toast.error("Oops! We couldn't delete the task. It must be hiding from us!")
              return;
            }
            if (data.tasks) {
              setTasks(data.tasks);
              toast.success("Success! The task has been deleted. Out of sight, out of mind!")
            }
          });
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Oops! We couldn't delete the task. It must be hiding from us!")
      }
    }
  };

  return (
    <div className="cardCol" ref={divRef}>
      <div className="colHeader">
        <h1>{status.replace("_", " ").toLowerCase()}</h1>
        <span className="count">{tasks.length}</span>
      </div>
      <div className="cardsContainer">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            tasksList={tasks}
            project={project}
            isAdmin={isAdmin}
            moveTask={moveTask}
            handleDeleteTask={handleDeleteTask}
            setTasks={setTasks}
          />
        ))}
      </div>
    </div>
  );
};
