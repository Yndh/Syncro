import Link from "next/link";
import { Note } from "../types/interfaces";
import { useContextMenu } from "../providers/ContextMenuProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../providers/ModalProvider";
import { useRef } from "react";
import Image from "next/image";
import { auth } from "@/auth";
import { useSession } from "next-auth/react";

interface NoteCardProps {
  note: Note;
  notes: Note[];
  isAdmin: boolean;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const NoteCard = ({ note, notes, isAdmin, setNotes }: NoteCardProps) => {
  const { setContextMenu } = useContextMenu();
  const { setModal } = useModal();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  const session = useSession();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      onClose: () => {
        setContextMenu(null);
      },
      content: (
        <ol className="contextMenuList">
          <li onClick={handleModal}>Edit</li>
          <li className="delete" onClick={() => handleDeleteNote(note.id)}>
            Delete
          </li>
        </ol>
      ),
      setContextMenu,
    });
  };

  const handleModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setModal({
      title: "Edit Note",
      content: (
        <form onSubmit={submitForm} id="updateNote">
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
              defaultValue={note.title}
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
              defaultValue={note.description}
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

    const prevNotes = [...notes];

    setNotes((prevNotes) =>
      prevNotes.map((disnote) =>
        disnote.id == note.id ? { ...note, title, description } : disnote
      )
    );

    await fetch(`/api/project/${note.projectId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        id: note.id,
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
          setNotes(prevNotes);
          return;
        }

        if (data.note) {
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id == data.note.id ? data.note : note
            )
          );
          return;
        }
      });
  };

  const handleDeleteNote = async (id: number) => {
    if (window.confirm(`Do you really want to delete note id ${id}?`)) {
      try {
        await fetch(`/api/project/${note.projectId}/note/${id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
              return;
            }
            if (data.notes) {
              console.log("data");
              console.log(data);

              setNotes(data.notes);
            }
          });
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again later.");
      }
    }
  };

  const displayNoteDetails = () => {
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
              <Image
                src={note.createdBy.image}
                alt={note.createdBy.name}
                width={30}
                height={30}
                className="memberAvatar"
              />
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
  };

  return (
    <div
      className="noteCard"
      onContextMenu={
        isAdmin || note.createdById === session.data?.user?.id
          ? handleContextMenu
          : () => {}
      }
      onClick={displayNoteDetails}
    >
      <div className="content">
        <div className="contentHeader">
          <p>{truncateText(note.title, 50)}</p>
          <span>{truncateText(note.description as string, 250)}</span>
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
          <Image
            src={note.createdBy.image}
            alt={note.createdBy.name}
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  );
};
