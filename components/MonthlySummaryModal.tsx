import React from 'react';
import MonthlySummary from './MonthlySummary';
import { XMarkIcon } from './Icons';

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number | null;
}

const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({ isOpen, onClose, year }) => {
  if (!isOpen || !year) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Resumo Mensal - {year}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
            <MonthlySummary year={year} />
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryModal;