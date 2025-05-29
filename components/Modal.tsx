
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl shadow-2xl border-2 border-yellow-400 max-w-md w-full transform transition-all scale-100 opacity-100 game-font-applied">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-yellow-300 font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-yellow-300 hover:text-yellow-100 text-2xl font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;