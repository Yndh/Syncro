"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const Projects = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const toggleCreating = () => {
    setIsCreating(!isCreating);
  };

  const submitForm = () => {};

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
            <input type="text" id="nameInput" placeholder="Project Name" />

            <label htmlFor="descInput">Description*</label>
            <input
              type="text"
              id="descInput"
              placeholder="Project Description"
            />

            <button>Create Project</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Projects;
