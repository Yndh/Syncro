"use client";

import React, { useRef, useState } from "react";
import { Invite, Project } from "../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCalendarXmark,
  faChevronRight,
  faHashtag,
  faInfinity,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Select from "./Select";
import { useModal } from "../providers/ModalProvider";
import { toast } from "react-toastify";

interface InviteDetailsProps {
  invite: Invite;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
}

const usesOptions = [
  {
    value: 1,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>1</span>
      </div>
    ),
  },
  {
    value: 5,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>5</span>
      </div>
    ),
  },
  {
    value: 10,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>10</span>
      </div>
    ),
  },
  {
    value: 20,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>20</span>
      </div>
    ),
  },
  {
    value: 25,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faHashtag} />
        <span>25</span>
      </div>
    ),
  },
  {
    value: "never",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faInfinity} />
        <span>Unlimited</span>
      </div>
    ),
  },
];

export const InviteDetails = ({ invite, setProject }: InviteDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { setModal } = useModal();

  const toggleOpen = () => setIsOpen(!isOpen);

  const deleteInvite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModal(null);
    try {
      await fetch(`/api/invite/${invite.linkId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(
              "Oops! We couldn’t delete the invite. Please try again!"
            );
            return;
          }

          if (data.success) {
            setProject((prevProject) =>
              prevProject
                ? {
                    ...prevProject,
                    projectInvitations: prevProject.projectInvitations.filter(
                      (i: Invite) => i.linkId !== invite.linkId
                    ),
                  }
                : undefined
            );
            toast.success("Success! The invite has been deleted!");
          }
        });
    } catch (err) {
      toast.error("Oops! We couldn’t delete the invite. Please try again!");
      return;
    }
  };

  const editMaxUses = async (maxUses: any) => {
    setModal(null);

    await fetch(`/api/invite/${invite.linkId}`, {
      method: "POST",
      body: JSON.stringify({
        maxUses: maxUses,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Oops! We couldn't update the invite. Please try again!");
          return;
        }

        if (data.success) {
          setProject((prevProject) =>
            prevProject
              ? {
                  ...prevProject,
                  projectInvitations: prevProject.projectInvitations.map(
                    (i: Invite) =>
                      i.linkId === invite.linkId
                        ? {
                            ...i,
                            maxUses: data.project.projectInvitations.find(
                              (inv: Invite) => inv.linkId === invite.linkId
                            )?.maxUses,
                          }
                        : i
                  ),
                }
              : undefined
          );
          toast.success("Success! The invite has been updated!");
        }
      });
  };

  const confirmDeletionModal = () => {
    setModal({
      title: "Confirm Invite Deletion",
      content: (
        <div className="header">
          <h1>Confirm Invite Deletion</h1>
          <p>
            Are you sure you want to delete this invite? Once it&apos;s gone, it
            can&apos;t be retrieved!.
          </p>
        </div>
      ),
      bottom: (
        <>
          <button onClick={deleteInvite}>Delete Invite</button>
          <button className="secondary" onClick={() => setModal(null)}>
            Cancel
          </button>
        </>
      ),
      setModal,
    });
  };

  return (
    <div className={`inviteDetails ${isOpen && "open"}`}>
      <div className="inviteDetailsHeader" onClick={toggleOpen}>
        <p>{invite.linkId}</p>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>

      <div className={`inviteDetailsContent`}>
        <div className="row">
          <label>
            <p>Code</p>
            <span>Invite code</span>
          </label>
          <p>{invite.linkId}</p>
        </div>
        <div className="row">
          <label>
            <p>Uses</p>
            <span>Users joined from invite</span>
          </label>
          <p>{invite.uses}</p>
        </div>
        <div className="row">
          <label>
            <p>Max Uses</p>
            <span>How many users can join</span>
          </label>
          <Select
            options={usesOptions}
            id="editMaxUsesSelect"
            selectedOption={usesOptions.find(
              (option) => option.value == (invite.maxUses ?? "never")
            )}
            onChange={(option) => {
              editMaxUses(option?.value);
            }}
          />
        </div>
        <div className="row">
          <label>
            <p>Actions</p>
            <span>Delete this invite</span>
          </label>
          <button onClick={confirmDeletionModal}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
};
