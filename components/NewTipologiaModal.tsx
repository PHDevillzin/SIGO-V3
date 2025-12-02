
import React, { useState } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';

interface NewTipologiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { titulo: string; descricao: string }) => void;
}

const NewTipologiaModal: React.FC<NewTipologiaModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ titulo: '', descricao: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0B1A4E]">Nova Tipologia</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Digite o título da Tipologia"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Digite a descrição da TAG"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end items-center pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center text-[#0B1A4E] font-semibold hover:text-opacity-80 transition-colors"
            >
              <span className="mr-1 text-lg">×</span> Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#0EA5E9] text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors shadow-sm"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
              <span>Enviar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTipologiaModal;
