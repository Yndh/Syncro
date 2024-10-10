"use client";

import { useRef, useState } from "react";
import { Invite } from "../types/interfaces";
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
import { useProjects } from "../providers/ProjectsProvider";
import { useModal } from "../providers/ModalProvider";
import { toast } from "react-toastify";

interface InviteDetailsProps {
  invite: Invite;
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


const expirationOptions = [
  {
    value: 30,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>30 min</span>
      </div>
    ),
  },
  {
    value: 60,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 h</span>
      </div>
    ),
  },
  {
    value: 360,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>6 h</span>
      </div>
    ),
  },
  {
    value: 720,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>12 h</span>
      </div>
    ),
  },
  {
    value: 1440,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 day</span>
      </div>
    ),
  },
  {
    value: 10080,
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>1 week</span>
      </div>
    ),
  },
  {
    value: "never",
    label: (
      <div className="roleSelect">
        <FontAwesomeIcon icon={faCalendarXmark} />
        <span>Never</span>
      </div>
    ),
  },
];

export const InviteDetails = ({ invite }: InviteDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const {projects, setProjects} = useProjects()
  const {setModal} = useModal()

  const toggleOpen = () => setIsOpen(!isOpen);

  const deleteInvite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (
      window.confirm(`Do you really want to delete invite ${invite.linkId}?`)
    ) {

      await fetch(`/api/invite/${invite.linkId}/join`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error("Oops! We couldn’t delete the invite. Please try again!")
            return;
          }

          if (data.project) {
            const dataProject = data.project[0]
            setProjects(projects.map(project => project.id == dataProject.id ? dataProject : project))
            toast.success("Success! The invite has been deleted!")
          }
        });
    }
  }; 

  const editMaxUses = async () => {
    const selectedDivUses = document.querySelector("#editMaxUsesSelect")!
    const inviteMaxUses = selectedDivUses.getAttribute("data-value") ?? usesOptions[0].value

    let uses: number | null = null
    if(inviteMaxUses !== "never"){
      uses = parseInt(inviteMaxUses.toString())
    }

    setModal(null)

    await fetch(`/api/invite/${invite.linkId}`, {
      method: "POST",
      body: JSON.stringify({
        maxUses: uses
      })
    })
    .then(res => res.json())
    .then((data) => {
      if(data.error){
        toast.error("Oops! We couldn't update the invite. Please try again!")
        return
      }

      if(data.invite){
        setProjects(
          projects.map((dproject) => 
            dproject.id === invite.projectId 
              ? {
                  ...dproject, 
                  projectInvitations: [
                    ...(dproject.projectInvitations || []),
                    data.invite,
                  ],
                } 
              : dproject
          )
        ); 
        toast.success("Success! The invite has been updated!")
      }
    })
  }

  const editExpirationDate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const expires = dateInputRef.current?.value;
    let isoExpires;
    if (expires) {
      const date = new Date(expires);
      if (isNaN(date.getTime())) {
        toast.warn("Oops! That due date is invalid. Please choose a future date!")
        return;
      }

      if (date < new Date()) {
        toast.warn("Uh-oh! Time travel isn't allowed here. Please pick a valid due date!")
        return;
      }

      isoExpires = new Date(expires).toISOString();
    }

    await fetch(`/api/invite/${invite.linkId}`, {
      method: "POST",
      body: JSON.stringify({
        expires: isoExpires
      })
    })
    .then(res => res.json())
    .then((data) => {
      if(data.error){
        toast.error("Oops! We couldn't retrieve the invite details!")
      }

      if(data.invite){
        setProjects(
          projects.map((dproject) => 
            dproject.id === invite.projectId 
              ? {
                  ...dproject, 
                  projectInvitations: [
                    ...(dproject.projectInvitations || []),
                    data.invite,
                  ],
                } 
              : dproject
          )
        ); 
        setModal(null)
      }
    })
  }

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
            onChange={(option) => {editMaxUses()} }
          />
        </div>
        <div className="row">
          <label>
            <p>Expiration date</p>
            <span>When invite expires</span>
          </label>
          {invite.expires ? (
            <input
            type="datetime-local"
            name=""
            id="dueToDate"
            onChange={editExpirationDate}
            ref={dateInputRef}
            defaultValue={new Date(invite.expires).toISOString().slice(0, 16)}
          />
          ) : (
            <Select options={expirationOptions} selectedOption={expirationOptions.find(option => option.value == "never")} onChange={() => {}}/>
          )}
        </div>
        <div className="row">
          <label>
            <p>Actions</p>
            <span>Delete this invite</span>
          </label>
          <button onClick={deleteInvite}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
};
