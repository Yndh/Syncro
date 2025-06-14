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
import { toast } from "react-toastify";

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
          <li className="delete" onClick={deleteNoteModal}>
            Delete
          </li>
        </ol>
      ),
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
      toast.warn("Hold on! A note needs a name. What should we call it?");
      return;
    }
    if (title.length > 100) {
      toast.warn(
        "Heads up! The task name is a bit too lengthy. Consider making it more concise!"
      );
      return;
    }

    const description = descInputRef.current?.value.trim() as string;
    if (description.length > 400) {
      toast.warn(
        "Heads up! The task description is a bit too long. Try to keep it brief!"
      );
      return;
    }

    setModal(null);

    const prevNotes = [...notes];

    setNotes((prevNotes) =>
      prevNotes.map((disnote) =>
        disnote.id == note.id ? { ...note, title, description } : disnote
      )
    );

    try {
      await fetch(`/api/project/${note.projectId}/note/${note.id}`, {
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
              "Yikes! The note couldn't be created. Even notes have their off days!"
            );
            setNotes(prevNotes);
            return;
          }

          if (data.note) {
            setNotes((prevNotes) =>
              prevNotes.map((note) =>
                note.id == data.note.id ? data.note : note
              )
            );
            toast.success(
              "Success! Your note has been created and is ready to rock!"
            );
          }
        });
    } catch (err) {
      console.error("Error creating task:", err);
      setNotes(prevNotes);
      toast.error(
        "Yikes! The note couldn't be created. Even notes have their off days!"
      );
    }
  };

  const deleteNoteModal = () => {
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
  };

  const handleDeleteNote = async () => {
    if (window.confirm(`Do you really want to delete note id ${note.id}?`)) {
      try {
        await fetch(`/api/project/${note.projectId}/note/${note.id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              toast.error(
                "Oops! The note didn't want to say goodbye. Let's try that again!"
              );
              return;
            }
            if (data.notes) {
              setNotes(data.notes);
              toast.success(
                "Success! The note has been deleted. Out of sight, out of mind!"
              );
            }
          });
      } catch (err) {
        console.error("Error deleting task:", err);
        toast.error(
          "Oops! The note didn't want to say goodbye. Let's try that again!"
        );
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
