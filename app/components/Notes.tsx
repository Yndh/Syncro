"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../providers/ModalProvider";
import { useRef, useState } from "react";
import { Note, Project } from "../types/interfaces";
import { NoteCard } from "./noteCard";
import { toast } from "react-toastify";

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
      toast.warn("Hold on! The Note needs a tite. What should we call it?");
      return;
    }
    if (title.length > 100) {
      toast.warn(
        "Heads up! The note title is a bit too lengthy. Consider making it more concise!"
      );
      return;
    }

    const description = descInputRef.current?.value.trim() as string;
    if (description.length < 1) {
      toast.warn(
        "Oops! A note without any content? What's the point? Please add some words!"
      );
      return;
    }
    if (description.length > 400) {
      toast.warn(
        "Heads up! The note description is a bit too long. Try to keep it brief!"
      );
      return;
    }

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
        if (data.error) {
          toast.error(
            "Yikes! The note refused to be created. Let’s give it another shot!"
          );
          return;
        }

        if (data.note) {
          setNotes([...notes, data.note]);
          toast.success(
            "Success! Your note has been created and is ready to shine!"
          );
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
