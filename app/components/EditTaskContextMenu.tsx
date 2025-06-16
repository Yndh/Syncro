"use client";

import { useEffect, useRef, useState } from "react";
import { useModal } from "../providers/ModalProvider";
import { toast } from "react-toastify";
import {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/app/types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faFlag,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Select from "@/app/components/Select";
import { createRoot } from "react-dom/client";
import { useProjects } from "../providers/ProjectsProvider";
import Image from "next/image";

interface EditTaskProps {
  task: Task;
  tasksList: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  moveTask: (task: Task, status: TaskStatus) => void;
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

const taskStatuses: TaskStatus[] = [
  TaskStatus.TO_DO,
  TaskStatus.ON_GOING,
  TaskStatus.REVIEWING,
  TaskStatus.DONE,
];

const EditTaskContextMenu = ({
  task,
  tasksList,
  setTasks,
  moveTask,
}: EditTaskProps) => {
  const { setModal } = useModal();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const membersListRef = useRef<HTMLDivElement>(null);
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<Project>();

  useEffect(() => {
    const proj = getProjectById(task.projectId);
    setProject(proj);
  }, [getProjectById, task.projectId]);

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
              {project &&
                project.members &&
                project.members.map((member) => (
                  <div key={member.id}>
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
                      <Image
                        width={64}
                        height={64}
                        src={member.user.image}
                        alt={member.user.name}
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
              onChange={(option) => {}}
              id="prioritySelect"
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

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = titleInputRef.current?.value.trim() as string;
    if (title.length < 1) {
      toast.warn("Hold on! The task needs a name. What should we call it?");
      return;
    }
    if (title.length > 100) {
      toast.warn(
        "Heads up! The task name is a bit too lengthy. Consider making it more concise!"
      );
      return;
    }

    const description = descInputRef.current?.value.trim() as string;
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
          "Uh-oh! Time travel isn't allowed here. Please pick a valid due date!"
        );
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
              priority: priority as TaskPriority,
            }
          : distask
      )
    );

    try {
      await fetch(`/api/project/${task.projectId}/task/${task.id}`, {
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
              "Oops! We couldn't update the task. It seems to be stuck in its old ways!"
            );
            setTasks(prevTask);
            return;
          }

          if (data.task) {
            setTasks((prevTasks) =>
              prevTasks.map((prevTask) =>
                prevTask.id == data.task.id ? data.task : prevTask
              )
            );
            toast.success(
              "Success! The task has been updated and is ready to shine!"
            );
          }
        });
    } catch (err) {
      toast.error(
        "Oops! We couldn't update the task. It seems to be stuck in its old ways!"
      );
      setTasks(prevTask);
    }
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

  const deleteTaskModal = () => {
    setModal({
      title: "Confirm Task Deletion",
      content: (
        <div className="header">
          <h1>Confirm Task Deletion</h1>
          <p>
            Are you sure you want to delete this task? Once it&apos;s gone, it
            can&apos;t be retrieved!.
          </p>
        </div>
      ),
      bottom: (
        <>
          <button onClick={() => handleDeleteTask(task.id)}>Delete Note</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm(`Do you really want to delete task id ${taskId}?`)) {
      try {
        await fetch(`/api/project/${task.projectId}/task/${taskId}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              toast.error(
                "Oops! We couldn't delete the task. It must be hiding from us!"
              );
              return;
            }
            if (data.tasks) {
              setTasks(data.tasks);
              toast.success(
                "Success! The task has been deleted. Out of sight, out of mind!"
              );
            }
          });
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error(
          "Oops! We couldn't delete the task. It must be hiding from us!"
        );
      }
    }
  };

  return (
    <ol className="contextMenuList">
      <li onClick={handleModal}>Edit</li>
      <li>
        Move <FontAwesomeIcon icon={faChevronRight} size="xs" />
        <ol>
          {taskStatuses.map((status) => (
            <li onClick={() => moveTask(task, status)} key={status}>
              {status.replace("_", " ")}
            </li>
          ))}
        </ol>
      </li>
      <li className="delete" onClick={deleteTaskModal}>
        Delete
      </li>
    </ol>
  );
};

export default EditTaskContextMenu;
