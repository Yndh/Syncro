import { useRef } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./taskCard";
import { Task } from "../types/interfaces";

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
    <div className="col" ref={divRef}>
      <h1>{status.replace("_", " ")}</h1>
      <div className="cardsContainer">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} moveTask={moveTask} />
        ))}
      </div>
    </div>
  );
};
