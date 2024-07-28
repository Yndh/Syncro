"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../providers/ModalProvider";
import { useRef, useState } from "react";
import { Note, Project } from "../types/interfaces";
import { NoteCard } from "./noteCard";

interface NotesProps {
  projectId: number;
  project: Project;
  isAdmin: boolean;
}

export const Notes = ({ isAdmin, projectId, project }: NotesProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<Note[]>(project.notes);
  const { setModal } = useModal();

  const handleModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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

          <button type="submit">Create Note</button>
          <button onClick={() => setModal(null)}>Close</button>
        </form>
      ),
      setModal,
    });
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = titleInputRef.current?.value.trim() as string;
    if (title.length < 1) {
      alert("Title is empty");
      return;
    }

    const description = descInputRef.current?.value.trim() as string;

    setModal(null);

    await fetch(`/api/project/${projectId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        title: title,
        description: description,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("NEW DATA ALERT");
        console.log(data);

        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.note) {
          setNotes([...notes, data.note]);
          return;
        }
      });
  };

  return (
    <div className="notesContainer">
      <h2>Team Notes</h2>
      <div className="notesGrid">
        {notes.map((note) => (
          <NoteCard
            note={note}
            notes={notes}
            setNotes={setNotes}
            key={note.id}
            isAdmin={isAdmin}
          />
        ))}
      </div>
      <button className="absoluteButton" onClick={handleModal}>
        <FontAwesomeIcon icon={faAdd} />
      </button>
    </div>
  );
};
