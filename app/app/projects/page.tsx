"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

const Projects = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  const toggleCreating = () => {
    setIsCreating(!isCreating);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = nameInputRef.current?.value as string;
    if (name.length < 1) {
      return;
    }

    const description = descInputRef.current?.value as string;
    if (description.length < 1) {
      return;
    }

    toggleCreating();

    await fetch("/api/project", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        alert(data.id);
      });
  };

  return (
    <>
      <div className="card" onClick={toggleCreating}>
        <FontAwesomeIcon icon={faAdd} />
        <p>New Project</p>
      </div>

      {isCreating && (
        <div className="modalContainer">
          <form onSubmit={submitForm}>
            <label htmlFor="nameInput">Name</label>
            <input
              type="text"
              id="nameInput"
              placeholder="Project Name"
              ref={nameInputRef}
            />

            <label htmlFor="descInput">Description*</label>
            <input
              type="text"
              id="descInput"
              placeholder="Project Description"
              ref={descInputRef}
            />

            <button>Create Project</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Projects;
