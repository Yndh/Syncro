"use client";

import { useModal } from "@/app/providers/ModalProvider";
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
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const { setModal } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch("/api/projects")
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
              return;
            }

            setProjectsList(data.projects);
          });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchData();
  }, []);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = nameInputRef.current?.value as string;
    if (name.trim().length < 1) {
      alert("Name is empty");
      return;
    }

    const description = descInputRef.current?.value as string;
    if (description.trim().length < 1) {
      alert("Description is empty");
      return;
    }

    setModal(null);

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

  const handleModal = () => {
    setModal({
      content: (
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
          <button onClick={() => setModal(null)}>Close</button>
        </form>
      ),
      setModal,
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
        <div className="card" onClick={handleModal}>
          <FontAwesomeIcon icon={faAdd} />
          <p>New Project</p>
        </div>
      </div>
    </>
  );
};

export default Projects;
