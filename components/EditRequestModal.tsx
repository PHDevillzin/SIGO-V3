import React, { useState, useEffect } from 'react';
import type { Request } from '../types';
import { XMarkIcon } from './Icons';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onSave: (updatedRequest: Request) => void;
  title?: string;
}

const investmentCategories = [
  'Reforma Operacional',
  'Baixa Complexidade',
  'Nova Unidade',
  'Intervenção Estratégica',
  'Manutenção',
];

const typologyOptions = [
    'Tipologia A',
    'Tipologia B',
    'Tipologia C',
    'Tipologia D',
];

const EditRequestModal: React.FC<EditRequestModalProps> = ({ isOpen, onClose, request, onSave, title }) => {
  const [formData, setFormData] = useState({
    tipologia: '',
    categoria: '',
    prazoObra: '',
    valorObra: '',
    inicioObra: '',
    finalObra: '',
    inicioProjeto: '',
    prazoProjeto: '',
    valorProjeto: '',
  });

  useEffect(() => {
    if (request) {
      setFormData({
        tipologia: '', // Start with placeholder
        categoria: '', // Start with placeholder
        prazoObra: '',
        valorObra: '',
        inicioObra: '',
        finalObra: '',
        inicioProjeto: '',
        prazoProjeto: '',
        valorProjeto: '',
      });
    }
  }, [request]);

  if (!isOpen || !request) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The description field was removed, so we pass the original request object back.
    // In a real scenario, other form fields would be saved here.
    onSave(request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title || 'Validar Demanda'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form id="edit-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Section for Tipologia and Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipologia" className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
              <select
                id="tipologia"
                name="tipologia"
                value={formData.tipologia}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Selecionar...</option>
                {typologyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria de investimento</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Selecionar...</option>
                {investmentCategories.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section for Obra */}
          <fieldset className="border rounded-md p-4">
            <legend className="text-lg font-medium text-gray-900 px-2">Obra</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <div>
                <label htmlFor="prazoObra" className="block text-sm font-medium text-gray-700 mb-1">Prazo obra</label>
                <input type="date" id="prazoObra" name="prazoObra" value={formData.prazoObra} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="valorObra" className="block text-sm font-medium text-gray-700 mb-1">Valor obra</label>
                <input type="text" id="valorObra" name="valorObra" value={formData.valorObra} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="inicioObra" className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                <input type="date" id="inicioObra" name="inicioObra" value={formData.inicioObra} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="finalObra" className="block text-sm font-medium text-gray-700 mb-1">Final</label>
                <input type="text" id="finalObra" name="finalObra" disabled className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed" placeholder="Calculado"/>
              </div>
            </div>
          </fieldset>
          
          {/* Section for Projeto */}
          <fieldset className="border rounded-md p-4">
            <legend className="text-lg font-medium text-gray-900 px-2">Projeto</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                    <label htmlFor="inicioProjeto" className="block text-sm font-medium text-gray-700 mb-1">Início projeto</label>
                    <input type="date" id="inicioProjeto" name="inicioProjeto" value={formData.inicioProjeto} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="prazoProjeto" className="block text-sm font-medium text-gray-700 mb-1">Prazo projeto (meses)</label>
                    <input type="number" id="prazoProjeto" name="prazoProjeto" value={formData.prazoProjeto} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="valorProjeto" className="block text-sm font-medium text-gray-700 mb-1">Valor projeto</label>
                    <input type="text" id="valorProjeto" name="valorProjeto" value={formData.valorProjeto} onChange={handleChange} className="mt-1 block w-full rounded-md border-black shadow-sm sm:text-sm"/>
                </div>
            </div>
          </fieldset>

        </form>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" form="edit-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditRequestModal;