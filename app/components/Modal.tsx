"use client";

import { useEffect, useRef } from "react";
import { useModal } from "../providers/ModalProvider";

export const Modal = () => {
  const { onClose, content, setModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalContainerRef.current && e.target === modalContainerRef.current) {
      setModal(null);
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
        {content}
      </div>
    </div>
  );
};
