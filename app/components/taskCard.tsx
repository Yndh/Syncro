"use client";

import { useRef } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  User,
} from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import Link from "next/link";
import { useSession } from "next-auth/react"

interface TaskCardProps {
  task: Task;
  tasksList: Task[];
  project: Project;
  isAdmin: boolean;
  moveTask: (id: number, status: TaskStatus) => void;
  handleDeleteTask: (taskId: number) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const taskStatuses: TaskStatus[] = [
  TaskStatus.TO_DO,
  TaskStatus.ON_GOING,
  TaskStatus.REVIEWING,
  TaskStatus.DONE,
];

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const priorities: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

export const TaskCard = ({
  task,
  tasksList,
  project,
  isAdmin,
  moveTask,
  handleDeleteTask,
  setTasks,
}: TaskCardProps) => {
  const session = useSession()
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

  console.log(task.assignedTo);
  console.log(session);
  
  
  const isAssigned = task.assignedTo.some(user => user.id === session.data?.user?.id);
  console.log(isAssigned);
  console.table(session);
  
  
  
  if(isAssigned || isAdmin){
    drag(cardRef);
  }

  const { setContextMenu } = useContextMenu();
  const { setModal } = useModal();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const membersListRef = useRef<HTMLDivElement>(null);
  const prioritiesListRef = useRef<HTMLDivElement>(null);

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
          <li onClick={handleModal}>Edit</li>
          <li>
            Move <FontAwesomeIcon icon={faChevronRight} size="xs" />
            <ol>
              {taskStatuses.map((status) => (
                <li onClick={() => moveTask(task.id, status)} key={status}>
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

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = titleInputRef.current?.value.trim() as string;
    if (title.length < 1) {
      alert("Title is empty");
      return;
    }

    const description = descInputRef.current?.value.trim() as string;
    const assignedMembers = getCheckedMemberIds();
    if (assignedMembers.length < 1) {
      alert("There is no assigned members");
      return;
    }

    const dueDate = dateInputRef.current?.value;
    let isoDueDate;
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        alert("Invalid due date");
        return;
      }

      if (date < new Date()) {
        alert("Time traveling is not allowed");
        return;
      }

      isoDueDate = new Date(dueDate).toISOString();
    }

    const priority = getSelectedPriority();

    setModal(null);

    const prevTask = [...tasksList]

    setTasks((prevTasks) =>
      prevTasks.map((distask) =>
        distask.id === task.id ? { ...distask, title: title, description: description, priority: priority as TaskPriority} : distask
      )
    );

    await fetch(`/api/project/${task.projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        id: task.id,
        title: title,
        description: description,
        assignedMembers: assignedMembers,
        dueDate: dueDate,
        priority: priority,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("updat?");

        console.log(data);

        if (data.error) {
          alert(data.error);
          setTasks(prevTask)
          return;
        }

        if (data.task as Task) {
          setTasks((prevTasks) =>
            prevTasks.map((prevTask) =>
              prevTask.id == data.task.id ? data.task : prevTask
            )
          );
        }
      });
  };

  const getCheckedMemberIds = (): string[] => {
    const checkedMembers: string[] = [];
    const checkboxes = membersListRef.current?.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    if (checkboxes) {
      checkboxes.forEach((checkbox) => {
        checkedMembers.push(checkbox.id.replace("radio", ""));
      });
    }
    return checkedMembers;
  };

  const getSelectedPriority = (): Priority => {
    let selectedPriority: Priority = "MEDIUM";
    const radios = prioritiesListRef.current?.querySelectorAll(
      'input[type="radio"]:checked'
    );
    if (radios && radios.length > 0) {
      selectedPriority = radios[0].id.replace("priority", "") as Priority;
    }
    return selectedPriority;
  };

  const handleModal = () => {
    setModal({
      content: (
        <form onSubmit={submitForm}>
          <label htmlFor="taskInput">Title</label>
          <input
            type="text"
            id="taskInput"
            placeholder="Task title"
            ref={titleInputRef}
            defaultValue={task.title}
          />

          <label htmlFor="descInput">Description*</label>
          <input
            type="text"
            id="descInput"
            placeholder="Task Description"
            ref={descInputRef}
            defaultValue={task.description}
          />

          <span>Assign To</span>
          <div className="membersList" ref={membersListRef}>
            {project.members &&
              project.members.map((member) => (
                <div>
                  <input
                    type="checkbox"
                    className="member"
                    name="todoAsign"
                    id={`member${member.id}`}
                    defaultChecked={task.assignedTo.some(
                      (tMember) => tMember.id === member.user.id
                    )}
                  />
                  <label htmlFor={`member${member.id}`}>
                    <img src={member.user.image} alt={member.user.name} />
                  </label>
                </div>
              ))}
          </div>

          <label htmlFor="dueToDate">Due to*</label>
          {task.dueTime && (
            <>
              {console.log(new Date(task.dueTime).toISOString())}
              <input
                type="datetime-local"
                name=""
                id="dueToDate"
                ref={dateInputRef}
                defaultValue={new Date(task.dueTime).toISOString().slice(0, 16)}
              />
            </>
          )}

          {!task.dueTime && (
            <>
              <span>no date {task.dueTime}</span>
              <input
                type="datetime-local"
                name=""
                id="dueToDate"
                ref={dateInputRef}
              />
            </>
          )}

          <label>Priority</label>
          <div className="prioritiesList" ref={prioritiesListRef}>
            {priorities.map((currPriority) => (
              <div key={currPriority}>
                <input
                  type="radio"
                  name="setPriority"
                  id={`priority${currPriority}`}
                  defaultChecked={task.priority === currPriority}
                />
                <label htmlFor={`priority${currPriority}`}>
                  {currPriority}
                </label>
              </div>
            ))}
          </div>

          <button type="submit">Update Task</button>
          <button onClick={() => setModal(null)}>Close</button>
        </form>
      ),
      setModal,
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

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const displayTaskDetails = () => {
    setModal({
      content: (
        <div className={`taskCard ${task.priority}`}>
          <div className={`indicator ${task.priority}`}></div>
          <div className="content">
            <h2>{task.title}</h2>
            <span>{task.description}</span>

            {displayAssignedMembers(task.assignedTo)}
            {task.dueTime && (
              <span className="dueTime">
                Due to&nbsp;
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "long",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(task.dueTime))}
              </span>
            )}
          </div>
        </div>
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
      <div className="content">
        <p>{truncateText(task.title, 50)}</p>
        <span>{truncateText(task.description as string, 250)}</span>
        {(task.description?.length ?? 0) > 250 && (
          <Link href={""}>Read more...</Link>
        )}
        {displayAssignedMembers(task.assignedTo)}
        {task.dueTime && (
          <span className="dueTime">
            Due to&nbsp;
            {new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "long",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(task.dueTime))}
          </span>
        )}
      </div>
    </div>
  );
};
