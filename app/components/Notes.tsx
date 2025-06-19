"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../providers/ModalProvider";
import { useRef, useState, useCallback, memo } from "react";
import { Note, Project } from "../types/interfaces";
import { NoteCard } from "./noteCard";
import { toast } from "react-toastify";

interface NotesProps {
  projectId: string;
  project: Project;
  isAdmin: boolean;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

export const Notes = memo(
  ({ isAdmin, projectId, project, setProject }: NotesProps) => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descInputRef = useRef<HTMLTextAreaElement>(null);
    const { setModal } = useModal();

    const submitForm = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const title = titleInputRef.current?.value.trim();
        if (!title) {
          toast.warn(
            "Hold on! The Note needs a title. What should we call it?"
          );
          return;
        }
        if (title.length > 100) {
          toast.warn(
            "Heads up! The note title is a bit too lengthy. Consider making it more concise!"
          );
          return;
        }

        const description = descInputRef.current?.value.trim();
        if (!description) {
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

        try {
          const res = await fetch(`/api/project/${projectId}/notes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              description,
            }),
          });
          const data = await res.json();

          if (data.error) {
            toast.error(
              "Yikes! The note refused to be created. Let's give it another shot!"
            );
          } else if (data.note) {
            setProject((prevProject) =>
              prevProject
                ? { ...prevProject, notes: [...prevProject.notes, data.note] }
                : prevProject
            );
            toast.success(
              "Success! Your note has been created and is ready to shine!"
            );
          }
        } catch (error) {
          console.error("Failed to create note:", error);
          toast.error("Failed to create the note due to a network error.");
        }
      },
      [projectId, setModal]
    );

    const handleModal = useCallback(() => {
      setModal({
        title: "New Note",
        content: (
          <form onSubmit={submitForm} id="createNote">
            <div className="formRow">
              <label htmlFor="noteTitleInput">
                <p>Title</p>
                <span>Title of note</span>
              </label>
              <input
                type="text"
                id="noteTitleInput"
                placeholder="Note title"
                ref={titleInputRef}
              />
            </div>

            <div className="formRow">
              <label htmlFor="noteDescInput">
                <p>Description</p>
                <span>Description of note</span>
              </label>
              <textarea
                id="noteDescInput"
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
    }, [setModal, submitForm]);

    return (
      <div className="notesContainer">
        <div className="notesheader">
          <h1>Notes</h1>
          <span className="count">{project.notes.length}</span>
        </div>
        <div className="notess">
          {project.notes.map((note) => (
            <NoteCard
              note={note}
              notes={project.notes}
              setProject={setProject}
              key={note.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
        {isAdmin && (
          <button className="absoluteButton" onClick={handleModal}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    );
  }
);

Notes.displayName = "Notes";
