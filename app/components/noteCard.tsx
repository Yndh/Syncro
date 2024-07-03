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
  isAdmin: boolean;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const NoteCard = ({ note, isAdmin, setNotes }: NoteCardProps) => {
  const { setContextMenu } = useContextMenu();
  const { setModal } = useModal();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

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
      content: (
        <form onSubmit={submitForm}>
          <label htmlFor="taskInput">Title</label>
          <input
            type="text"
            id="taskInput"
            placeholder="Task title"
            ref={titleInputRef}
            defaultValue={note.title}
          />

          <label htmlFor="descInput">Description*</label>
          <input
            type="text"
            id="descInput"
            placeholder="Task Description"
            ref={descInputRef}
            defaultValue={note.description as string}
          />

          <button type="submit">Update Note</button>
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
      content: (
        <div className="noteCard">
          <h2>{note.title}</h2>
          <span>{note.description}</span>
          <Image
            src={note.createdBy.image}
            alt={note.createdBy.name}
            width={30}
            height={30}
          />
        </div>
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
      <p>{truncateText(note.title, 50)}</p>
      <span>{truncateText(note.description as string, 250)}</span>
      {(note.description?.length ?? 0) > 250 && (
        <Link href={""}>Read more...</Link>
      )}
      <Image
        src={note.createdBy.image}
        alt={note.createdBy.name}
        width={30}
        height={30}
      />
    </div>
  );
};
