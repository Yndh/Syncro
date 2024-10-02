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
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const [notes, setNotes] = useState<Note[]>(project.notes);
  const { setModal } = useModal();

  const handleModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setModal({
      title: "New Note",
      content: (
        <form onSubmit={submitForm} id="createNote">
          <div className="formRow">
            <label htmlFor="taskInput">
              <p>Title</p>
              <span>Title of note</span>
            </label>
            <input
              type="text"
              id="taskInput"
              placeholder="Note title"
              ref={titleInputRef}
            />
          </div>

          <div className="formRow">
            <label htmlFor="descInput">
              <p>Description</p>
              <span>Description of note</span>
            </label>
            <textarea
              id="descInput"
              placeholder="Note Description"
              ref={descInputRef}
            />
          </div>
        </form>
      ),
      bottom: (
        <>
          <button type="submit" form="createNote">
            Create Note
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
      <div className="notesheader">
        <h1>Notes</h1>
        <span className="count">{notes.length}</span>
      </div>
      <div className="notess">
        <div className="column">
          {notes
            .filter((_, index) => index % 4 === 0)
            .map((note) => (
              <NoteCard
                note={note}
                notes={notes}
                setNotes={setNotes}
                key={note.id}
                isAdmin={isAdmin}
              />
            ))}
        </div>
        <div className="column">
          {notes
            .filter((_, index) => index % 4 === 1)
            .map((note) => (
              <NoteCard
                note={note}
                notes={notes}
                setNotes={setNotes}
                key={note.id}
                isAdmin={isAdmin}
              />
            ))}
        </div>
        <div className="column">
          {notes
            .filter((_, index) => index % 4 === 2)
            .map((note) => (
              <NoteCard
                note={note}
                notes={notes}
                setNotes={setNotes}
                key={note.id}
                isAdmin={isAdmin}
              />
            ))}
        </div>
        <div className="column">
          {notes
            .filter((_, index) => index % 4 === 3)
            .map((note) => (
              <NoteCard
                note={note}
                notes={notes}
                setNotes={setNotes}
                key={note.id}
                isAdmin={isAdmin}
              />
            ))}
        </div>
      </div>
      <button className="absoluteButton" onClick={handleModal}>
        <FontAwesomeIcon icon={faAdd} />
      </button>
    </div>
  );
};
