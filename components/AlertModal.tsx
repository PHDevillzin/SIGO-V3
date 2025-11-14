import React from 'react';
import { CheckCircleIcon } from './Icons';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>
        <h2 id="alert-modal-title" className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
