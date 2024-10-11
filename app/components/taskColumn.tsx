"use client";

import { useRef } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./taskCard";
import { Project, Task, TaskStatus } from "../types/interfaces";

interface DragItem {
  task: Task;
  type: string;
}

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  isAdmin: boolean;
  showProject?: boolean
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  moveTask: (task: Task, status: TaskStatus) => void;
}

export const TaskColumn = ({
  status,
  tasks,
  isAdmin,
  moveTask,
  setTasks,
  showProject = false
}: TaskColumnProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item: DragItem) => moveTask(item.task, status),
    }),
    [status]
  );
  drop(divRef);


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
            isAdmin={isAdmin}
            moveTask={moveTask}
            setTasks={setTasks}
            showProject={showProject}
          />
        ))}
      </div>
    </div>
  );
};
