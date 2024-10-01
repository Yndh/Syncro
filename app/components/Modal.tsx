"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useModal } from "../providers/ModalProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

export const Modal = () => {
  const { title, content, bottom, setModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalContainerRef.current && e.target === modalContainerRef.current) {
      setModal(null); // Close the modal
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`modalContainer ${content && "visible"}`}
      ref={modalContainerRef}
    >
      <div className="modal" ref={modalRef}>
        <div className="title">
          <h1>{title}</h1>
          <button onClick={() => setModal(null)}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="content">{content as ReactNode}</div>
        <div className="bottom">{bottom}</div>
      </div>
    </div>
  );
};
