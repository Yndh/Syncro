"use client";

import { useRef, useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { Task, User } from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface TaskCardProps {
  task: Task;
  projectId: number;
  moveTask: (id: number, status: Task["taskStatus"]) => void;
  handleDeleteTask: (taskId: number) => void;
}

const taskStatuses: Task["taskStatus"][] = [
  "TO_DO",
  "ON_GOING",
  "REVIEWING",
  "DONE",
];

export const TaskCard = ({
  task,
  moveTask,
  projectId,
  handleDeleteTask,
}: TaskCardProps) => {
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
  const { setContextMenu } = useContextMenu();

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      onClose: () => {
        setContextMenu(null);
      },
      content: (
        <ol className="contextMenuList">
          <li>Edit</li>
          <li>
            Move <FontAwesomeIcon icon={faChevronRight} size="xs" />
            <ol>
              {taskStatuses.map((status) => (
                <li onClick={() => moveTask(task.id, status)}>
                  {status.replace("_", " ")}
                </li>
              ))}
            </ol>
          </li>
          <li className="delete" onClick={() => handleDeleteTask(task.id)}>
            Delete
          </li>
        </ol>
      ),
      setContextMenu,
    });
  };

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
