import { useRef } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./taskCard";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueTime?: Date;
  projectId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  taskStatus: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  assignedTo: User[];
  createdAt: Date;
  updatedAt: Date;
}

interface DragItem {
  id: number;
  type: string;
}

interface TaskColumnProps {
  status: Task["taskStatus"];
  tasks: Task[];
  moveTask: (id: number, status: Task["taskStatus"]) => void;
}

export const TaskColumn = ({ status, tasks, moveTask }: TaskColumnProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item: DragItem) => moveTask(item.id, status),
    }),
    [status]
  );

  drop(divRef);

  return (
    <div ref={divRef} className="col">
      <h1>{status.replace("_", " ")}</h1>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} moveTask={moveTask} />
      ))}
    </div>
  );
};
