"use client";

import { useEffect, useRef } from "react";
import { useContextMenu } from "../providers/ContextMenuProvider";

const ContextMenu = () => {
  const { x, y, onClose, content } = useContextMenu();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { setContextMenu } = useContextMenu();

  const handleClick = () => {
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const taskOptionsContainer = document.querySelector(
        ".taskOptionsContainer"
      );

      const isClickInsideContextMenu =
        contextMenuRef.current &&
        contextMenuRef.current.contains(e.target as Node);

      const isClickOnTaskOptionsContainer =
        taskOptionsContainer === e.target ||
        (taskOptionsContainer &&
          taskOptionsContainer.contains(e.target as Node));

      if (!(isClickInsideContextMenu || isClickOnTaskOptionsContainer)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setContextMenu]);

  return (
    <div
      className="contextMenu"
      style={{ left: x, top: y }}
      ref={contextMenuRef}
      onClick={handleClick}
    >
      {content}
    </div>
  );
};

export default ContextMenu;
