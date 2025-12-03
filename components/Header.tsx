
import React from 'react';
import { CalendarDaysIcon, DocumentDuplicateIcon } from './Icons';

interface HeaderProps {
  title: string;
  selectedProfile: string;
  setCurrentView?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, selectedProfile, setCurrentView }) => {
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
      
      {setCurrentView && title === 'Solicitações' && (
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => setCurrentView('nova_unidade')}
                className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
                Abrir Solicitação
            </button>
            <button 
                onClick={() => setCurrentView('nova_estrategica')}
                className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
                Abrir Estratégia
            </button>
            <button 
                onClick={() => setCurrentView('nova_sede')}
                className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
                Abrir SEDE
            </button>
        </div>
      )}
    </div>
  );
};

export default Header;
