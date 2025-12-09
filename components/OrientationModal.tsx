
import React from 'react';
import { ExclamationTriangleIcon, LinkIcon, CheckIcon } from './Icons';

interface OrientationModalProps {
  onConfirm: () => void;
  type: 'Sede' | 'Estratégica' | 'Unidade';
}

const OrientationModal: React.FC<OrientationModalProps> = ({ onConfirm, type }) => {
  let textType = '';
  switch(type) {
      case 'Sede': textType = 'corporativa'; break;
      case 'Estratégica': textType = 'estratégica'; break;
      case 'Unidade': textType = 'da unidade'; break;
      default: textType = '';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-6">
           <ExclamationTriangleIcon className="w-8 h-8 text-gray-400 fill-current" />
           <h2 className="text-3xl font-bold text-[#0B1A4E]">Atenção</h2>
        </div>
        
        <p className="text-gray-800 text-center text-lg mb-8 leading-relaxed">
          Antes de prosseguir com o cadastro da solicitação {textType} é importante
          que você leia as orientações sobre o processo.
        </p>
        
        <a href="#" className="flex items-center space-x-2 text-sky-500 hover:text-sky-600 mb-10 text-lg font-medium transition-colors">
          <LinkIcon className="w-6 h-6" />
          <span>Anexo de Orientação - Clique aqui para baixar.</span>
        </a>
        
        <button 
          onClick={onConfirm}
          className="flex items-center space-x-2 bg-[#0EA5E9] text-white font-bold py-3 px-8 rounded-md hover:bg-sky-600 transition-colors text-lg"
        >
          <CheckIcon className="w-6 h-6 stroke-[3px]" />
          <span>Li e estou pronto</span>
        </button>
      </div>
    </div>
  );
};

export default OrientationModal;
