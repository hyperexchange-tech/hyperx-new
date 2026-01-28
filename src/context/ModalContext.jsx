import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setModalOpen = (isOpen) => {
    setIsModalOpen(isOpen);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};