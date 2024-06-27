"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./taskColumn";
import { Task, User } from "../types/interfaces";

interface ToDoProps {
  projectId: number;
  isOwner: boolean;
  owner: User | undefined;
  members: User[] | undefined;
  tasks: Task[];
}

const ToDo = ({ projectId, isOwner, owner, members, tasks }: ToDoProps) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [assignedMembers, setAssignedMembers] = useState<String[]>([]);
  const [tasksList, setTasksList] = useState<Task[]>(tasks);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = titleInputRef.current?.value.trim() as string;
    if (title.length < 1) {
      alert("Title is empty");
      return;
    }

    const description = descInputRef.current?.value.trim() as string;

    if (assignedMembers.length < 1) {
      alert("There is no assigned members");
      return;
    }

    const dueDate = dateInputRef.current?.value;
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
    }

    toggleCreating();

    await fetch(`/api/project/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: title,
        description: description,
        assignedMembers: assignedMembers,
        dueDate: dueDate,
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

  const toggleCreating = () => {
    setIsCreating(!isCreating);
    setAssignedMembers([]);
  };

  const assignMember = (memberId: string) => {
    setAssignedMembers((members) => {
      if (members.includes(memberId)) {
        return members.filter((id) => id !== memberId);
      } else {
        return [...members, memberId];
      }
    });
  };

  const moveTask = async (taskId: number, newStatus: Task["taskStatus"]) => {
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
          status="TO_DO"
          tasks={tasksList.filter((task) => task.taskStatus === "TO_DO")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
        />
        <TaskColumn
          status="ON_GOING"
          tasks={tasksList.filter((task) => task.taskStatus === "ON_GOING")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
        />
        <TaskColumn
          status="REVIEWING"
          tasks={tasksList.filter((task) => task.taskStatus === "REVIEWING")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
        />
        <TaskColumn
          status="DONE"
          tasks={tasksList.filter((task) => task.taskStatus === "DONE")}
          moveTask={moveTask}
          projectId={projectId}
          setTasks={setTasksList}
        />

        {isOwner && (
          <button className="newTaskButton" onClick={toggleCreating}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
      {isCreating && isOwner && (
        <div className="modalContainer">
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
            <div className="membersList">
              {owner && (
                <>
                  <input
                    type="checkbox"
                    className="member"
                    name="todoAsign"
                    id="ownerRadio"
                    onChange={() => assignMember(owner.id)}
                  />
                  <label htmlFor="ownerRadio">
                    <img src={owner.image} alt={owner.name} />
                  </label>
                </>
              )}
              {members &&
                members.map((member) => (
                  <>
                    <input
                      type="checkbox"
                      className="member"
                      name="todoAsign"
                      id={`radio${member.id}`}
                      onChange={() => assignMember(member.id)}
                    />
                    <label htmlFor={`radio${member.id}`}>
                      <img src={member.image} alt={member.name} />
                    </label>
                  </>
                ))}
            </div>

            <label htmlFor="dueToDate">Due to*</label>
            <input
              type="datetime-local"
              name=""
              id="dueToDate"
              ref={dateInputRef}
            />

            <button type="submit">Create Task</button>
            <button onClick={toggleCreating}>Close</button>
          </form>
        </div>
      )}
    </DndProvider>
  );
};

export default ToDo;
