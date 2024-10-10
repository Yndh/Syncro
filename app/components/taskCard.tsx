"use client";

import { useRef, useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import {
  Project,
  Task,
  TaskPriority,
  TaskStage,
  TaskStatus,
  User,
} from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faFlag,
  faGripVertical,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { createRoot } from "react-dom/client";
import Select from "./Select";
import Image from "next/image";
import { toast } from "react-toastify";

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

const options = [
  {
    value: TaskPriority.LOW as string,
    label: (
      <div className="prioritySelect low">
        <FontAwesomeIcon icon={faFlag} />
        <span>Low</span>
      </div>
    ),
  },
  {
    value: TaskPriority.MEDIUM as string,
    label: (
      <div className="prioritySelect medium">
        <FontAwesomeIcon icon={faFlag} />
        <span>Medium</span>
      </div>
    ),
  },
  {
    value: TaskPriority.HIGH as string,
    label: (
      <div className="prioritySelect high">
        <FontAwesomeIcon icon={faFlag} />
        <span>High</span>
      </div>
    ),
  },
  {
    value: TaskPriority.URGENT as string,
    label: (
      <div className="prioritySelect urgent">
        <FontAwesomeIcon icon={faFlag} />
        <span>Urgent</span>
      </div>
    ),
  },
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
  const session = useSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(
    task.priority
  );
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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
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
          <li className="delete" onClick={deleteTaskModal}>
            Delete
          </li>
        </ol>
      ),
      setContextMenu,
    });
  };

  const deleteTaskModal = () => {
    setModal({
      title: "Confirm Task Deletion",
      content: (
        <div className="header">
          <h1>Confirm Task Deletion</h1>
          <p>Are you sure you want to delete this task? Once it's gone, it can't be retrieved!.</p>
        </div>
      ),
      bottom: (
        <>
        <button onClick={() =>  handleDeleteTask(task.id)}>Delete Note</button>
        <button className="secondary" onClick={() => setModal(null)}>Cancel</button>
        </>
      ),
      setModal
    })
  }

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = titleInputRef.current?.value.trim() as string;
    if (title.length < 1) {
      toast.warn("Hold on! The task needs a name. What should we call it?")
      return;
    }

    const description = descInputRef.current?.value.trim() as string;
    const assignedMembers = getCheckedMemberIds();
    if (assignedMembers.length < 1) {
      toast.warn("Hold up! A task needs a team! Please assign at least one member to get things rolling!")
      return;
    }

    const dueDate = dateInputRef.current?.value;
    let isoDueDate;
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        toast.warn("Oops! That due date is invalid. Please choose a future date!")
        return;
      }

      if (date < new Date()) {
        toast.warn("Uh-oh! Time travel isn't allowed here. Please pick a valid due date!")
        return;
      }

      isoDueDate = new Date(dueDate).toISOString();
    }

    const stages = getStages();

    setModal(null);

    const prevTask = [...tasksList];

    setTasks((prevTasks) =>
      prevTasks.map((distask) =>
        distask.id === task.id
          ? {
              ...distask,
              title: title,
              description: description,
              priority: selectedPriority as TaskPriority,
            }
          : distask
      )
    );

    await fetch(`/api/project/${task.projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        id: task.id,
        title: title,
        description: description,
        assignedMembers: assignedMembers,
        dueDate: isoDueDate,
        priority: selectedPriority,
        stages: stages,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Oops! We couldn’t update the task. It seems to be stuck in its old ways!")
          setTasks(prevTask);
          return;
        }

        if (data.task) {
          setTasks((prevTasks) =>
            prevTasks.map((prevTask) =>
              prevTask.id == data.task.id ? data.task : prevTask
            )
          );
          toast.success("Success! The task has been updated and is ready to shine!")
        }
      });
  };

  const getCheckedMemberIds = (): string[] => {
    const checkedMembers: string[] = [];
    const checkboxes = membersListRef.current?.querySelectorAll(
      '.membersList input[type="checkbox"]:checked'
    );
    if (checkboxes) {
      checkboxes.forEach((checkbox) => {
        checkedMembers.push(checkbox.id.replace("radio", ""));
      });
    }
    return checkedMembers;
  };

  const handleModal = () => {
    setModal({
      title: "Edit Task",
      content: (
        <form onSubmit={submitForm} id="updateTask">
          <div className="formRow">
            <label htmlFor="taskInput">
              <p>Name</p>
              <span>Name of task</span>
            </label>
            <input
              type="text"
              id="taskInput"
              placeholder="Task title"
              ref={titleInputRef}
              defaultValue={task.title}
            />
          </div>

          <div className="formRow">
            <label htmlFor="descInput">
              <p>Description</p>
              <span>Description of task</span>
            </label>
            <textarea
              id="descInput"
              placeholder="Task Description"
              ref={descInputRef}
              defaultValue={task.description}
            />
          </div>

          <div className="formRow">
            <label htmlFor="stages">
              <p>Sub tasks</p>
              <span>Create subtasks</span>
            </label>
            <div className="stagesContainer">
              <ul className="stagesList">
                {task.stages.map((stage, index) => (
                  <li key={index} className="newStageContainer">
                    <input
                      id={`stage${stage.id}`}
                      type="text"
                      placeholder="Stage name"
                      defaultValue={stage.title}
                    />
                    <button type="button" onClick={() => removeStage(index)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={addStage}>
                <FontAwesomeIcon icon={faPlus} />
                Add subtask
              </button>
            </div>
          </div>

          <div className="formRow">
            <label>
              <p>Asignee</p>
              <span>Asign task to members of the project</span>
            </label>
            <div className="membersList" ref={membersListRef}>
              {project.members &&
                project.members.map((member) => (
                  <div>
                    <input
                      type="checkbox"
                      className="member"
                      name="todoAsign"
                      id={`${member.userId}`}
                      defaultChecked={task.assignedTo.some(
                        (tMember) => tMember.id === member.user.id
                      )}
                    />
                    <label htmlFor={`${member.userId}`}>
                      <img src={member.user.image} alt={member.user.name} />
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div className="formRow">
            <label htmlFor="dueToDate">
              <p>Due Date</p>
              <span>Deadline of task</span>
            </label>
            {task.dueTime && (
              <>
                <input
                  type="datetime-local"
                  name=""
                  id="dueToDate"
                  ref={dateInputRef}
                  defaultValue={new Date(task.dueTime)
                    .toISOString()
                    .slice(0, 16)}
                />
              </>
            )}

            {!task.dueTime && (
              <>
                <input
                  type="datetime-local"
                  name=""
                  id="dueToDate"
                  ref={dateInputRef}
                />
              </>
            )}
          </div>

          <div className="formRow">
            <label>
              <p>Priority</p>
              <span>Set priority of task</span>
            </label>
            <Select
              options={options}
              onChange={(option) =>
                setSelectedPriority(option?.value as string)
              }
              selectedOption={options.find(
                (option) => option.value == task.priority
              )}
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="updateTask">
            Update Task
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const addStage = () => {
    const stagesList = document.querySelector(".stagesList");

    const li = document.createElement("li");
    li.className = "newStageContainer";

    const input = document.createElement("input");
    input.placeholder = "Add new stage";

    const removeButton = document.createElement("button");
    removeButton.onclick = () => {
      li.remove();
    };
    removeButton.type = "button";

    const root = createRoot(removeButton);
    root.render(<FontAwesomeIcon icon={faTrash} />);

    li.appendChild(input);
    li.appendChild(removeButton);
    stagesList?.appendChild(li);
  };

  const removeStage = (index: number) => {
    const stagesList = document.querySelector(".stagesList");
    if (stagesList) {
      const stageItems = stagesList.querySelectorAll("li");
      if (index >= 0 && index < stageItems.length) {
        stageItems[index].remove();
      }
    }
  };
  const getStages = () => {
    const stages = Array.from(
      document.querySelectorAll(".stagesList input")
    ).map((input) => {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id.replace("stage", "");

      const stage: any = {
        title: inputElement.value.trim(),
      };

      if (id) {
        stage.id = parseInt(id);
      }

      stage.isCompleted = task.stages.find(
        (stagee) => stagee.id == stage.id
      )?.isCompleted;

      return stage;
    });

    return stages;
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
          toast.error("Uh-oh! We couldn't update the task stage. It seems to be stuck in limbo!")
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

          {(task.stages && task.stages.length > 0) && (
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
      <div className="content">
        <div className="contentHeader">
          <p>{truncateText(task.title, 50)}</p>
          <span>{truncateText(task.description as string, 250)}</span>
          {(task.description?.length ?? 0) > 250 && (
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
