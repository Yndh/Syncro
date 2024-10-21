"use client";

import { useRef } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { Task, TaskStage, TaskStatus, User } from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "react-toastify";
import EditTaskContextMenu from "./EditTaskContextMenu";

interface TaskCardProps {
  task: Task;
  tasksList: Task[];
  isAdmin: boolean;
  showProject?: boolean;
  moveTask: (task: Task, status: TaskStatus) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}
export const TaskCard = ({
  task,
  tasksList,
  isAdmin,
  setTasks,
  moveTask,
  showProject = false,
}: TaskCardProps) => {
  const session = useSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: { task: task },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [task]
  );

  const isAssigned = task.assignedTo.some(
    (user) => user.id === session.data?.user?.id
  );

  if (
    (isAssigned &&
      (task.taskStatus == "TO_DO" || task.taskStatus == "ON_GOING")) ||
    isAdmin
  ) {
    drag(cardRef);
  }

  const { setContextMenu } = useContextMenu();
  const { setModal } = useModal();

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("click");

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      onClose: () => {
        setContextMenu(null);
      },
      content: (
        <EditTaskContextMenu
          task={task}
          tasksList={tasksList}
          setTasks={setTasks}
          moveTask={moveTask}
        />
      ),
      setContextMenu,
    });
  };

  const updateStage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    stageId: number
  ) => {
    const prevTask = [...tasksList];

    setTasks((prevTasks) =>
      prevTasks.map((prevTask) =>
        prevTask.id == task.id
          ? {
              ...prevTask,
              stages: prevTask.stages.map((stage) =>
                stage.id === stageId
                  ? { ...stage, isCompleted: e.target.checked }
                  : stage
              ),
            }
          : prevTask
      )
    );

    const check = e.target.checked;

    await fetch(`/api/project/${task.projectId}/stages`, {
      method: "POST",
      body: JSON.stringify({
        id: stageId,
        taskId: task.id,
        isCompleted: check,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(
            "Uh-oh! We couldn't update the task stage. It seems to be stuck in limbo!"
          );
          setTasks(prevTask);
          e.target.checked = !check;
          return;
        }

        if (data.stage as TaskStage) {
          setTasks((prevTasks) =>
            prevTasks.map((prevTask) =>
              prevTask.id == data.stage.taskId
                ? {
                    ...prevTask,
                    stages: prevTask.stages.map((stage) =>
                      stage.id === data.stage.id ? data.stage : stage
                    ),
                  }
                : prevTask
            )
          );
        }
      });
  };

  const displayAssignedMembers = (members: User[]) => {
    const MAX_NUM_OF_MEMBERS = 2;
    const remainingMembers = members.length - MAX_NUM_OF_MEMBERS;

    return (
      <div className="assignedMembers">
        {members.slice(0, MAX_NUM_OF_MEMBERS).map((member) => (
          <Image
            key={member.id}
            src={member.image}
            alt={member.name}
            className="memberAvatar"
            width={30}
            height={30}
          />
        ))}
        {remainingMembers > 0 && <span>+{remainingMembers}</span>}
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const displayTaskDetails = () => {
    setModal({
      title: task.taskStatus.replace("_", " ").toLowerCase(),
      content: (
        <>
          <div className="header">
            <h2>{task.title}</h2>
            <span>{task.description}</span>
          </div>

          {task.stages && task.stages.length > 0 && (
            <div className="stages">
              <p>Subtasks</p>
              {task.stages.map((stage) => (
                <div className="stage">
                  <input
                    type="checkbox"
                    id={`stage${stage.id}`}
                    defaultChecked={stage.isCompleted}
                    onChange={(e) => updateStage(e, stage.id)}
                    disabled={
                      !isAssigned ||
                      (!isAdmin &&
                        (task.taskStatus == "REVIEWING" ||
                          task.taskStatus == "DONE"))
                    }
                  />
                  <label htmlFor={`stage${stage.id}`}>{stage.title}</label>
                </div>
              ))}
            </div>
          )}

          <div className="contentBottom">
            <div>
              {task.dueTime && (
                <span className="dueTime">
                  {new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                  }).format(new Date(task.dueTime))}{" "}
                  {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                    new Date(task.dueTime)
                  )}
                </span>
              )}
            </div>
            {displayAssignedMembers(task.assignedTo)}
          </div>
        </>
      ),
      bottom: (
        <>
          <button onClick={() => setModal(null)} className="secondary">
            Close
          </button>
        </>
      ),
      setModal,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`taskCard ${task.priority}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onContextMenu={isAdmin ? handleContextMenu : () => {}}
      onClick={displayTaskDetails}
    >
      <div className={`indicator ${task.priority}`}></div>
      {((isAssigned &&
        (task.taskStatus == "TO_DO" || task.taskStatus == "ON_GOING")) ||
        isAdmin) && (
        <div className="gripContainer">
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
      )}
      <div className="taskOptionsContainer" onClick={handleContextMenu}>
        <FontAwesomeIcon icon={faEllipsis} />
      </div>
      <div className="content">
        <div className="contentHeader">
          {showProject && (
            <span className="projectName">{task.project?.name}</span>
          )}
          <p>{truncateText(task.title, 50)}</p>
          <span>{truncateText(task.description as string, 150)}</span>
          {(task.description?.length ?? 0) > 150 && (
            <Link href={""}>Read more...</Link>
          )}
        </div>

        {(task.stages && task.stages.length) > 0 && (
          <div className="progressContainer">
            <div className="progressText">
              <span>Progress</span>
              <p>
                {task.stages.filter((stage) => stage.isCompleted).length}/
                {task.stages.length}
              </p>
            </div>
            <div className="progress">
              {task.stages
                .sort((a, b) =>
                  a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1
                )
                .map((stage) => (
                  <span
                    key={`stage${stage.id}`}
                    className={stage.isCompleted ? "completed" : ""}
                  ></span>
                ))}
            </div>
          </div>
        )}

        <div className="contentBottom">
          <div>
            {task.dueTime && (
              <span className="dueTime">
                {new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
                  new Date(task.dueTime)
                )}{" "}
                {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                  new Date(task.dueTime)
                )}
              </span>
            )}
          </div>
          {displayAssignedMembers(task.assignedTo)}
        </div>
      </div>
    </div>
  );
};
