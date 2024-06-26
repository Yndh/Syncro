import { useRef } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";

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

interface TaskCardProps {
  task: Task;
  moveTask: (id: number, status: Task["taskStatus"]) => void;
}

export const TaskCard = ({ task, moveTask }: TaskCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: { id: task.id },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [task.id]
  );

  drag(cardRef);

  return (
    <div
      ref={cardRef}
      className={`taskCard ${task.priority}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={`indicator ${task.priority}`}></div>
      <div className="content">
        <p>{task.title}</p>
        <span>{task.description}</span>
      </div>
    </div>
  );
};
