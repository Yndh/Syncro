"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./taskColumn";
import { Project, Task, TaskStatus } from "../types/interfaces";
import NewTask from "./NewTask";
import { toast } from "react-toastify";

interface ToDoProps {
  projectId?: number;
  tasks: Task[]
  isAdmin: boolean;
  showProject?: boolean
}

const ToDo = ({ projectId, isAdmin, tasks, showProject = false }: ToDoProps) => {
  const [tasksList, setTasksList] = useState<Task[]>(tasks);

  console.log("IN todo");
  console.log(tasksList);
  

  const moveTask = async (task: Task, newStatus: TaskStatus) => {
    const prevTasksList = [...tasksList];

    setTasksList((prevTasks) =>
      prevTasks.map((prevTask) =>
        prevTask.id === task.id ? { ...prevTask, taskStatus: newStatus } : prevTask
      )
    );

    await fetch(`/api/project/${task.projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        id: task.id,
        taskStatus: newStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setTasksList(prevTasksList);
          toast.error("Uh-oh! We couldn't move the task. It seems to have a mind of its own!")
          return;
        }

        if (data.task) {
          setTasksList((prevTasks) =>
            prevTasks.map((prevTask) =>
              prevTask.id === data.task.id
                ? { ...prevTask, taskStatus: data.task.taskStatus }
                : prevTask
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
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.ON_GOING}
          tasks={tasksList.filter((task) => task.taskStatus === "ON_GOING")}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.REVIEWING}
          tasks={tasksList.filter((task) => task.taskStatus === "REVIEWING")}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={tasksList.filter((task) => task.taskStatus === "DONE")}
          isAdmin={isAdmin}
          moveTask={moveTask}
          setTasks={setTasksList}
          showProject={showProject}
        />

        {isAdmin && projectId && (
          <NewTask projectId={projectId} setTasksList={setTasksList} tasksList={tasksList} />
        )}
      </div>
    </DndProvider>
  );
};

export default ToDo;
