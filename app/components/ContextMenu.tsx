"use client";

import { useEffect, useRef } from "react";
import { useContextMenu } from "../providers/ContextMenuProvider";

const ContextMenu = () => {
  const { x, y, onClose, content } = useContextMenu();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { setContextMenu } = useContextMenu();

  const handleClickOutside = (e: MouseEvent) => {
    if (
      !(
        contextMenuRef.current &&
        contextMenuRef.current.contains(e.target as Node)
      )
    ) {
      onClose(); // idk why this shit doesnt work brah
      setContextMenu(null);
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
      className="contextMenu"
      style={{ left: x, top: y }}
      ref={contextMenuRef}
    >
      {content}
    </div>
  );
};

export default ContextMenu;
