
import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';

interface TipoLocalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (descricao: string) => void;
  initialValue?: string;
  isEditing?: boolean;
}

const TipoLocalModal: React.FC<TipoLocalModalProps> = ({ isOpen, onClose, onSave, initialValue = '', isEditing = false }) => {
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDescricao(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      setError('Campo obrigatório não preenchido.');
      return;
    }
    onSave(descricao.trim());
  };

  const MAX_CHARS = 500;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0B1A4E]">
            {isEditing ? 'Editar Tipo Local' : 'Novo Tipo Local'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => {
                  setDescricao(e.target.value);
                  if (error) setError(null);
              }}
              placeholder="Digite a descrição do Tipo local"
              className={`w-full border rounded-md px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
              maxLength={MAX_CHARS}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <div className="text-right text-xs text-gray-400 mt-1">
                {descricao.length}/{MAX_CHARS}
            </div>
          </div>

          <div className="flex justify-end items-center pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center text-gray-600 font-semibold hover:text-gray-800 transition-colors"
            >
              <span className="mr-1 text-lg">×</span> Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#0EA5E9] text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
              <span>{isEditing ? 'Salvar' : 'Enviar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoLocalModal;
