"use client";

import {
  faAdd,
  faFlag,
  faMinus,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./taskColumn";
import { Project, Task, TaskPriority, TaskStatus } from "../types/interfaces";
import { useModal } from "../providers/ModalProvider";
import Image from "next/image";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import Select from "./Select";
import { toast } from "react-toastify";

interface ToDoProps {
  projectId: number;
  project: Project;
  isAdmin: boolean;
}

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

const ToDo = ({ projectId, isAdmin, project }: ToDoProps) => {
  const [tasksList, setTasksList] = useState<Task[]>(project.tasks);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const membersListRef = useRef<HTMLDivElement>(null);
  const { setModal } = useModal();

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

    const priorityDiv = document.querySelector("#prioritySelect")!
    const priority = priorityDiv.getAttribute("data-value") ?? options[0].value

    const stages = getStages();

    const dueDate = dateInputRef.current?.value;
    let isoDueDate;
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        toast.warn("Oops! That due date is invalid. Please choose a future date!")
        return;
      }

      if (date < new Date()) {
        toast.warn("Uh-oh! Time travel isn’t allowed here. Please pick a valid due date!")
        return;
      }

      isoDueDate = new Date(dueDate).toISOString();
    }

    setModal(null);

    await fetch(`/api/project/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: title,
        description: description,
        assignedMembers: assignedMembers,
        dueDate: isoDueDate,
        priority: priority,
        stages: stages,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Yikes! We couldn’t create the task. It seems to be playing hard to get!")
          return;
        }

        if (data.task) {
          setTasksList([...tasksList, data.task]);
          toast.success("Success! Your task has been created and is ready to tackle!")
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

  const getStages = () => {
    const stagesList: string[] = [];
    const stageElements = document.querySelectorAll(".stagesList input");

    stageElements.forEach((stage) => {
      const stageName = (stage as HTMLInputElement).value.trim();
      if (stageName) {
        stagesList.push(stageName);
      }
    });

    return stagesList;
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

  const handleModal = () => {
    setModal({
      title: "New Task",
      content: (
        <form onSubmit={submitForm} id="createTask">
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
            />
          </div>

          <div className="formRow">
            <label htmlFor="stages">
              <p>Sub tasks</p>
              <span>Create subtasks</span>
            </label>
            <div className="stagesContainer">
              <ul className="stagesList"></ul>
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
                      id={member.user.id}
                    />
                    <label htmlFor={member.user.id}>
                      <Image
                        src={member.user.image}
                        alt={member.user.name}
                        width={40}
                        height={40}
                      />
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
            <input
              type="datetime-local"
              name=""
              id="dueToDate"
              ref={dateInputRef}
            />
          </div>

          <div className="formRow">
            <label>
              <p>Priority</p>
              <span>Set priority of task</span>
            </label>
            <Select
              options={options}
              id="prioritySelect"
              onChange={(option) =>
              {}
              }
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="createTask">
            Create Task
          </button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const moveTask = async (taskId: number, newStatus: TaskStatus) => {
    const prevTasksList = [...tasksList];

    setTasksList((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, taskStatus: newStatus } : task
      )
    );

    await fetch(`/api/project/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        id: taskId,
        taskStatus: newStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setTasksList(prevTasksList);
          console.error("Uh-oh! We couldn't move the task. It seems to have a mind of its own!")
          return;
        }

        if (data.task) {
          setTasksList((prevTasks) =>
            prevTasks.map((task) =>
              task.id === data.task.id
                ? { ...task, taskStatus: data.task.taskStatus }
                : task
            )
          );
        }
      });
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todoContainer">
        <TaskColumn
          status={TaskStatus.TO_DO}
          tasks={tasksList.filter((task) => task.taskStatus === "TO_DO")}
          project={project}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
        />
        <TaskColumn
          status={TaskStatus.ON_GOING}
          tasks={tasksList.filter((task) => task.taskStatus === "ON_GOING")}
          project={project}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
        />
        <TaskColumn
          status={TaskStatus.REVIEWING}
          tasks={tasksList.filter((task) => task.taskStatus === "REVIEWING")}
          project={project}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={tasksList.filter((task) => task.taskStatus === "DONE")}
          project={project}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
        />

        {isAdmin && (
          <button className="absoluteButton" onClick={handleModal}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </DndProvider>
  );
};

export default ToDo;
