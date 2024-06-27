"use client";

import { useRef, useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { Task, User } from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";

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
  const { setContextMenu } = useContextMenu();

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();

    console.log(setContextMenu);

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      onClose: () => {
        setContextMenu(null);
      },
      content: (
        <ol className="contextMenuList">
          <li>Edit</li>
          <li className="delete">Delete</li>
        </ol>
      ),
      setContextMenu,
    });
  };

  drag(cardRef);

  const displayAssignedMembers = (members: User[]) => {
    const MAX_NUM_OF_MEMBERS = 2;
    const remainingMembers = members.length - MAX_NUM_OF_MEMBERS;

    return (
      <div className="assignedMembers">
        {members.slice(0, MAX_NUM_OF_MEMBERS).map((member) => (
          <img
            key={member.id}
            src={member.image}
            alt={member.name}
            className="memberAvatar"
          />
        ))}
        {remainingMembers > 0 && <span>+{remainingMembers}</span>}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`taskCard ${task.priority}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onContextMenu={handleContextMenu}
    >
      <div className={`indicator ${task.priority}`}></div>
      <div className="content">
        <p>{task.title}</p>
        <span>{task.description}</span>
        {displayAssignedMembers(task.assignedTo)}
      </div>
    </div>
  );
};
