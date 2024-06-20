"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Project {
  id: number;
  name: string;
  description?: string;
}

const Projects = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
            return;
          }

          setProjectsList(data.projects);
        });
    };

    fetchData();
  }, []);

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

    await fetch("/api/projects", {
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
      <div className="projectsList">
        {projectsList.map((project) => (
          <Link href={`/app/projects/${project.id}`}>
            <div className="card">
              <p>{project.name}</p>
              <span>{project.description}</span>
            </div>
          </Link>
        ))}
        <div className="card" onClick={toggleCreating}>
          <FontAwesomeIcon icon={faAdd} />
          <p>New Project</p>
        </div>
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

            <button type="submit">Create Project</button>
            <button onClick={toggleCreating}>Close</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Projects;
