"use client";

import {
  faAdd,
  faFlag,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../providers/ModalProvider";
import Select from "./Select";
import { Project, Task, TaskPriority } from "../types/interfaces";
import { toast } from "react-toastify";
import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useProjects } from "../providers/ProjectsProvider";
import Image from "next/image";

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

interface NewTaskProps {
  projectId: string;
  tasksList: Task[];
  setTasksList: React.Dispatch<React.SetStateAction<Task[]>>;
}

const NewTask = ({ projectId, tasksList, setTasksList }: NewTaskProps) => {
  const { setModal } = useModal();
  const { getProjectById } = useProjects();

  const [project, setProject] = useState<Project>();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const membersListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const proj = getProjectById(projectId);
    setProject(proj);
  }, [getProjectById, projectId]);

  const getCheckedMemberIds = useCallback((): string[] => {
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
  }, []);

  const getStages = useCallback(() => {
    const stagesList: string[] = [];
    const stageElements = document.querySelectorAll(".stagesList input");

    stageElements.forEach((stage) => {
      const stageName = (stage as HTMLInputElement).value.trim();
      if (stageName) {
        stagesList.push(stageName);
      }
    });

    return stagesList;
  }, []);

  const addStage = useCallback(() => {
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
  }, []);

  const submitForm = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const title = (titleInputRef.current?.value as string).trim();
      if (title === "") {
        toast.warn("Hold on! The task needs a name. What should we call it?");
        return;
      }
      if (title.length > 100) {
        toast.warn(
          "Heads up! The task name is a bit too lengthy. Consider making it more concise!"
        );
        return;
      }

      const description = (descInputRef.current?.value as string).trim();
      if (description.length > 400) {
        toast.warn(
          "Heads up! The task description is a bit too long. Try to keep it brief!"
        );
        return;
      }
      const assignedMembers = getCheckedMemberIds();
      if (assignedMembers.length < 1) {
        toast.warn(
          "Hold up! A task needs a team! Please assign at least one member to get things rolling!"
        );
        return;
      }

      let priority = "";
      try {
        const priorityDiv = document.querySelector("#prioritySelect")!;
        priority = priorityDiv.getAttribute("data-value") ?? options[0].value;
      } catch (err) {
        toast.warn(
          "Oops! Every task needs a priority. Pick one to keep things on track!"
        );
        return;
      }

      const stages = getStages();

      const dueDate = dateInputRef.current?.value;
      let isoDueDate;
      if (dueDate) {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
          toast.warn(
            "Oops! That due date is invalid. Please choose a future date!"
          );
          return;
        }

        if (date < new Date()) {
          toast.warn(
            "Uh-oh! Time travel isn’t allowed here. Please pick a valid due date!"
          );
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
            toast.error(
              "Yikes! We couldn't create the task. It seems to be playing hard to get!"
            );
            return;
          }

          if (data.task) {
            setTasksList([...tasksList, data.task]);
            toast.success(
              "Success! Your task has been created and is ready to tackle!"
            );
          }
        });
    },
    [
      getCheckedMemberIds,
      getStages,
      projectId,
      setModal,
      setTasksList,
      tasksList,
    ]
  );

  const handleModal = useCallback(() => {
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
              <p>Assignee</p>
              <span>Assign task to members of the project</span>
            </label>
            <div className="membersList" ref={membersListRef}>
              {project?.members?.map((member) => (
                <div key={`member${member.id}`}>
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
              onChange={(option) => {}}
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
  }, [addStage, project, setModal, submitForm]);

  return (
    <button className="absoluteButton" onClick={handleModal}>
      <FontAwesomeIcon icon={faAdd} />
    </button>
  );
};

export default NewTask;
