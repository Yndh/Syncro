"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

interface ContextMenuState {
  x: number;
  y: number;
  onClose: () => void;
  content: JSX.Element | null;
}

interface ContextMenuContextType extends ContextMenuState {
  setContextMenu: (contextMenuState: ContextMenuState | null) => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(
  undefined
);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider");
  }
  return context;
};

interface ContextMenuProviderProps {
  children: ReactNode;
}

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  const setContextMenu = useCallback((newState: ContextMenuState | null) => {
    setContextMenuState(newState);
  }, []);

  useEffect(() => {
    const disableContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  const contextMenuValue = useMemo<ContextMenuContextType>(
    () => ({
      x: contextMenuState?.x ?? 0,
      y: contextMenuState?.y ?? 0,
      onClose: contextMenuState?.onClose ?? (() => {}),
      content: contextMenuState?.content ?? null,
      setContextMenu,
    }),
    [contextMenuState, setContextMenu]
  );

  return (
    <ContextMenuContext.Provider value={contextMenuValue}>
      {children}
    </ContextMenuContext.Provider>
  );
};
