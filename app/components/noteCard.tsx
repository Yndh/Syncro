"use client";

import Link from "next/link";
import { Note } from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useRef, useCallback, memo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface NoteCardProps {
  note: Note;
  notes: Note[];
  isAdmin: boolean;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const NoteCard = memo(
  ({ note, notes, isAdmin, setNotes }: NoteCardProps) => {
    const { setContextMenu } = useContextMenu();
    const { setModal } = useModal();
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descInputRef = useRef<HTMLTextAreaElement>(null);

    const { data: session } = useSession({
      required: true,
    });

    const truncateText = useCallback((text: string, maxLength: number) => {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    }, []);

    const handleDeleteNote = useCallback(async () => {
      setModal(null);
      if (window.confirm(`Do you really want to delete note id ${note.id}?`)) {
        try {
          const res = await fetch(
            `/api/project/${note.projectId}/note/${note.id}`,
            {
              method: "DELETE",
            }
          );
          const data = await res.json();

          if (data.error) {
            toast.error(
              "Oops! The note didn't want to say goodbye. Let's try that again!"
            );
          } else if (data.notes) {
            setNotes(data.notes);
            toast.success(
              "Success! The note has been deleted. Out of sight, out of mind!"
            );
          }
        } catch (err) {
          console.error("Error deleting note:", err);
          toast.error(
            "Oops! The note didn't want to say goodbye. Let's try that again!"
          );
        }
      }
    }, [note.id, note.projectId, setModal, setNotes]);

    const deleteNoteModal = useCallback(() => {
      setContextMenu(null);
      setModal({
        title: "Confirm Note Deletion",
        content: (
          <div className="header">
            <h1>Confirm Note Deletion</h1>
            <p>
              Are you sure you want to delete this note? Once it&apos;s gone, it
              can&apos;t be retrieved!.
            </p>
          </div>
        ),
        bottom: (
          <>
            <button onClick={handleDeleteNote}>Delete Note</button>
            <button className="secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
          </>
        ),
        setModal,
      });
    }, [handleDeleteNote, setContextMenu, setModal]);

    const submitForm = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setContextMenu(null);

        const title = titleInputRef.current?.value.trim();
        if (!title) {
          toast.warn("Hold on! A note needs a name. What should we call it?");
          return;
        }
        if (title.length > 100) {
          toast.warn(
            "Heads up! The note name is a bit too lengthy. Consider making it more concise!"
          );
          return;
        }

        const description = descInputRef.current?.value.trim();
        if ((description?.length ?? 0) > 400) {
          toast.warn(
            "Heads up! The note description is a bit too long. Try to keep it brief!"
          );
          return;
        }

        setModal(null);

        const prevNotes = notes;

        setNotes((prev) =>
          prev.map((disnote) =>
            disnote.id === note.id ? { ...note, title, description } : disnote
          )
        );

        try {
          const res = await fetch(
            `/api/project/${note.projectId}/note/${note.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title,
                description,
              }),
            }
          );
          const data = await res.json();

          if (data.error) {
            toast.error(
              "Yikes! The note couldn't be updated. Even notes have their off days!"
            );
            setNotes(prevNotes);
          } else if (data.note) {
            setNotes((prev) =>
              prev.map((n) => (n.id === data.note.id ? data.note : n))
            );
            toast.success(
              "Success! Your note has been updated and is ready to rock!"
            );
          }
        } catch (err) {
          console.error("Error updating note:", err);
          setNotes(prevNotes);
          toast.error(
            "Yikes! The note couldn't be updated. Even notes have their off days!"
          );
        }
      },
      [note, notes, setModal, setNotes, setContextMenu]
    );

    const handleEditModal = useCallback(() => {
      setContextMenu(null);
      setModal({
        title: "Edit Note",
        content: (
          <form onSubmit={submitForm} id="updateNote">
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
                defaultValue={note.title}
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
                defaultValue={note.description ?? ""}
              />
            </div>
          </form>
        ),
        bottom: (
          <>
            <button type="submit" form="updateNote">
              Update Note
            </button>
            <button className="secondary" onClick={() => setModal(null)}>
              Close
            </button>
          </>
        ),
        setModal,
      });
    }, [note.title, note.description, setContextMenu, setModal, submitForm]);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          onClose: () => {
            setContextMenu(null);
          },
          content: (
            <ol className="contextMenuList">
              <li onClick={handleEditModal}>Edit</li>
              <li className="delete" onClick={deleteNoteModal}>
                Delete
              </li>
            </ol>
          ),
        });
      },
      [deleteNoteModal, handleEditModal, setContextMenu]
    );

    const displayNoteDetails = useCallback(() => {
      setModal({
        title: "Note",
        content: (
          <>
            <div className="header">
              <h2>{note.title}</h2>
              <span>{note.description}</span>
            </div>
            <div className="contentBottom">
              <div>
                <span className="createdTime">
                  {new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                  }).format(new Date(note.createdAt))}{" "}
                  {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                    new Date(note.createdAt)
                  )}
                </span>
              </div>
              <div className="assignedMembers">
                {note.createdBy?.image && note.createdBy?.name && (
                  <Image
                    src={note.createdBy.image}
                    alt={note.createdBy.name}
                    width={30}
                    height={30}
                    className="memberAvatar"
                  />
                )}
              </div>
            </div>
          </>
        ),
        bottom: (
          <>
            <button className="secondary" onClick={() => setModal(null)}>
              Close
            </button>
          </>
        ),
        setModal,
      });
    }, [note, setModal]);

    const showContextMenu = isAdmin || session?.user?.id === note.createdById;

    return (
      <div
        className="noteCard"
        onContextMenu={showContextMenu ? handleContextMenu : undefined}
        onClick={displayNoteDetails}
      >
        <div className="content">
          <div className="contentHeader">
            <p>{truncateText(note.title, 50)}</p>
            <span>{truncateText(note.description ?? "", 250)}</span>
            {(note.description?.length ?? 0) > 250 && (
              <Link href={""}>Read more...</Link>
            )}
          </div>
          <div className="contentBottom">
            <div>
              <span className="createdTime">
                {new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
                  new Date(note.createdAt)
                )}{" "}
                {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                  new Date(note.createdAt)
                )}
              </span>
            </div>
            {note.createdBy?.image && note.createdBy?.name && (
              <Image
                src={note.createdBy.image}
                alt={note.createdBy.name}
                width={30}
                height={30}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

NoteCard.displayName = "NoteCard";
