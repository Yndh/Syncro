"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./taskColumn";
import { Project, Task, TaskStatus } from "../types/interfaces";
import { useModal } from "../providers/ModalProvider";
import Image from "next/image";

interface ToDoProps {
  projectId: number;
  project: Project;
  isOwner: boolean;
}
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const ToDo = ({ projectId, isOwner, project }: ToDoProps) => {
  const [tasksList, setTasksList] = useState<Task[]>(project.tasks);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const membersListRef = useRef<HTMLDivElement>(null);
  const prioritiesListRef = useRef<HTMLDivElement>(null);
  const { setModal } = useModal();

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

    await fetch(`/api/project/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: title,
        description: description,
        assignedMembers: assignedMembers,
        dueTime: isoDueDate,
        priority: priority,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.task) {
          setTasksList([...tasksList, data.task]);
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
          />

          <label htmlFor="descInput">Description*</label>
          <input
            type="text"
            id="descInput"
            placeholder="Task Description"
            ref={descInputRef}
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

          <label htmlFor="dueToDate">Due to*</label>
          <input
            type="datetime-local"
            name=""
            id="dueToDate"
            ref={dateInputRef}
          />

          <label>Priority</label>
          <div className="prioritiesList" ref={prioritiesListRef}>
            {priorities.map((currPriority) => (
              <div key={currPriority}>
                <input
                  type="radio"
                  name="setPriority"
                  id={`priority${currPriority}`}
                />
                <label htmlFor={`priority${currPriority}`}>
                  {currPriority}
                </label>
              </div>
            ))}
          </div>

          <button type="submit">Create Task</button>
          <button onClick={() => setModal(null)}>Close</button>
        </form>
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
          alert(data.error);
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
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
          project={project}
        />
        <TaskColumn
          status={TaskStatus.ON_GOING}
          tasks={tasksList.filter((task) => task.taskStatus === "ON_GOING")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
          project={project}
        />
        <TaskColumn
          status={TaskStatus.REVIEWING}
          tasks={tasksList.filter((task) => task.taskStatus === "REVIEWING")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
          project={project}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={tasksList.filter((task) => task.taskStatus === "DONE")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
          project={project}
        />

        {isOwner && (
          <button className="absoluteButton" onClick={handleModal}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </DndProvider>
  );
};

export default ToDo;
