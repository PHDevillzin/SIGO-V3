import React from 'react';
import { CalendarDaysIcon, DocumentDuplicateIcon } from './Icons';

interface HeaderProps {
  title: string;
  selectedProfile: string;
}

const Header: React.FC<HeaderProps> = ({ title, selectedProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      {selectedProfile === 'Planejamento' && (
        <div className="flex items-center space-x-2">
          <button className="flex items-center justify-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors">
            <CalendarDaysIcon className="w-5 h-5" />
            <span>Planejamento</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors">
            <DocumentDuplicateIcon className="w-5 h-5" />
            <span>Plurianual</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;