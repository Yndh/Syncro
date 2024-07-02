"use client";

import { useRef } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./taskCard";
import { Project, Task, TaskStatus, User } from "../types/interfaces";

interface DragItem {
  id: number;
  type: string;
}

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projectId: number;
  project: Project;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  moveTask: (id: number, status: TaskStatus) => void;
}

export const TaskColumn = ({
  status,
  tasks,
  project,
  moveTask,
  projectId,
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
        await fetch(`/api/project/${projectId}/task/${taskId}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
              return;
            }
            if (data.tasks) {
              console.log("data");
              console.log(data);

              setTasks(data.tasks);
            }
          });
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again later.");
      }
    }
  };

  return (
    <div className="col" ref={divRef}>
      <h1>{status.replace("_", " ")}</h1>
      <div className="cardsContainer">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            moveTask={moveTask}
            handleDeleteTask={handleDeleteTask}
            project={project}
            setTasks={setTasks}
          />
        ))}
      </div>
    </div>
  );
};
