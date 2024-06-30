"use client";

import { ReactNode, createContext, useContext, useState } from "react";

interface ModalState {
  content: ReactNode | null;
  setModal: (modalState: ModalState | null) => void;
}

const ModalContext = createContext<ModalState | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useContext must be used within a ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const setModal = (newModalState: ModalState | null) => {
    setModalState(newModalState);
  };

  const modalValue: ModalState = {
    content: modalState?.content || null,
    setModal,
  };

  return (
    <ModalContext.Provider value={modalValue}>{children}</ModalContext.Provider>
  );
};
