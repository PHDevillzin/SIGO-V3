import React, { useState, useEffect } from 'react';
import type { PlanningData } from '../types';
import { XMarkIcon } from './Icons';

interface ProjectWorkDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PlanningData | null;
  onSave: (updatedData: PlanningData) => void;
}

const ProjectWorkDataModal: React.FC<ProjectWorkDataModalProps> = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState<Partial<PlanningData>>({});

  useEffect(() => {
    if (data) {
        setFormData({
            inicioProjeto: data.inicioProjeto,
            inicioObra: data.inicioObra,
            saldoObraValor: data.saldoObraValor,
            saldoProjetoValor: data.saldoProjetoValor,
            saldoObraPrazo: data.saldoObraPrazo,
            saldoProjetoPrazo: data.saldoProjetoPrazo,
            situacao: data.situacao,
        });
    } else {
        setFormData({});
    }
  }, [data]);

  if (!isOpen || !data) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'date') {
        if (!value) {
            setFormData(prev => ({ ...prev, [name]: 'N/A' }));
            return;
        }
        const [year, month, day] = value.split('-');
        setFormData(prev => ({ ...prev, [name]: `${day}/${month}/${year}` }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...data, ...formData } as PlanningData);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === 'N/A' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Dados de projeto e obra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form id="project-work-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="inicioProjeto" className="block text-sm font-medium text-gray-700 mb-1">Início Projeto</label>
              <input type="date" id="inicioProjeto" name="inicioProjeto" value={formatDateForInput(formData.inicioProjeto || '')} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="inicioObra" className="block text-sm font-medium text-gray-700 mb-1">Início Obra</label>
              <input type="date" id="inicioObra" name="inicioObra" value={formatDateForInput(formData.inicioObra || '')} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="saldoProjetoValor" className="block text-sm font-medium text-gray-700 mb-1">Saldo Projeto Valor</label>
              <input type="text" id="saldoProjetoValor" name="saldoProjetoValor" value={formData.saldoProjetoValor || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="saldoObraValor" className="block text-sm font-medium text-gray-700 mb-1">Saldo Obra Valor</label>
              <input type="text" id="saldoObraValor" name="saldoObraValor" value={formData.saldoObraValor || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
             <div>
              <label htmlFor="saldoProjetoPrazo" className="block text-sm font-medium text-gray-700 mb-1">Saldo Projeto Prazo (meses)</label>
              <input type="number" id="saldoProjetoPrazo" name="saldoProjetoPrazo" value={formData.saldoProjetoPrazo || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="saldoObraPrazo" className="block text-sm font-medium text-gray-700 mb-1">Saldo Obra Prazo (meses)</label>
              <input type="number" id="saldoObraPrazo" name="saldoObraPrazo" value={formData.saldoObraPrazo || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="situacao" className="block text-sm font-medium text-gray-700 mb-1">Situação</label>
              <input type="text" id="situacao" name="situacao" value={formData.situacao || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed"/>
            </div>
          </div>
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" form="project-work-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkDataModal;
