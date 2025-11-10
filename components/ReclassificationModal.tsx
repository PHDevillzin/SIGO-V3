import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface ReclassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  selectedCount: number;
}

const investmentCategories = [
  'Baixa Complexidade',
  'Reforma Operacional',
  'Nova Unidade',
  'Intervenção Estratégica',
];

const typologyOptions = [
    'Tipologia A',
    'Tipologia B',
    'Tipologia C',
    'Tipologia D',
].sort();

const ReclassificationModal: React.FC<ReclassificationModalProps> = ({ isOpen, onClose, onSave, selectedCount }) => {
  const [formData, setFormData] = useState({
    tipologia: '',
    categoria: '',
    inicioProjeto: '',
    prazoProjeto: '',
    valorProjeto: '',
    terminoProjeto: '',
    inicioObra: '',
    prazoObra: '',
    valorObra: '',
    terminoObra: '',
  });

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
        setFormData({
            tipologia: '',
            categoria: '',
            inicioProjeto: '',
            prazoProjeto: '',
            valorProjeto: '',
            terminoProjeto: '',
            inicioObra: '',
            prazoObra: '',
            valorObra: '',
            terminoObra: '',
        });
    }
  }, [isOpen]);
  
  const calculateEndDate = (startDate: string, months: string) => {
      if (!startDate || !months) return '';
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + parseInt(months, 10));
      return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
      setFormData(prev => ({ ...prev, terminoProjeto: calculateEndDate(prev.inicioProjeto, prev.prazoProjeto) }));
  }, [formData.inicioProjeto, formData.prazoProjeto]);
  
  useEffect(() => {
      setFormData(prev => ({ ...prev, terminoObra: calculateEndDate(prev.inicioObra, prev.prazoObra) }));
  }, [formData.inicioObra, formData.prazoObra]);


  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const title = `Reclassificação de Solicitação${selectedCount > 1 ? 's' : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form id="reclassification-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {selectedCount > 0 && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700" role="alert">
              <p className="font-bold">Atenção</p>
              <p>Você está reclassificando {selectedCount} demanda{selectedCount > 1 ? 's' : ''}. Os dados inseridos serão aplicados a todos os itens selecionados.</p>
            </div>
          )}
          {/* Section for Tipologia and Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipologia" className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
              <select
                id="tipologia"
                name="tipologia"
                value={formData.tipologia}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Selecionar...</option>
                {investmentCategories.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section for Projeto */}
          <fieldset className="border rounded-md p-4">
            <legend className="text-lg font-medium text-gray-900 px-2">Projeto</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                <div>
                    <label htmlFor="inicioProjeto" className="block text-sm font-medium text-gray-700 mb-1">Início projeto</label>
                    <input type="date" id="inicioProjeto" name="inicioProjeto" value={formData.inicioProjeto} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="prazoProjeto" className="block text-sm font-medium text-gray-700 mb-1">Prazo (meses)</label>
                    <input type="number" id="prazoProjeto" name="prazoProjeto" value={formData.prazoProjeto} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="valorProjeto" className="block text-sm font-medium text-gray-700 mb-1">Valor projeto</label>
                    <input type="text" id="valorProjeto" name="valorProjeto" value={formData.valorProjeto} onChange={handleChange} placeholder="R$ 0,00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="terminoProjeto" className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                    <input type="text" id="terminoProjeto" name="terminoProjeto" value={formData.terminoProjeto} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed" placeholder="Calculado"/>
                </div>
            </div>
          </fieldset>

          {/* Section for Obra */}
          <fieldset className="border rounded-md p-4">
            <legend className="text-lg font-medium text-gray-900 px-2">Obra</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
               <div>
                <label htmlFor="inicioObra" className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                <input type="date" id="inicioObra" name="inicioObra" value={formData.inicioObra} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="prazoObra" className="block text-sm font-medium text-gray-700 mb-1">Prazo (meses)</label>
                <input type="number" id="prazoObra" name="prazoObra" value={formData.prazoObra} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="valorObra" className="block text-sm font-medium text-gray-700 mb-1">Valor obra</label>
                <input type="text" id="valorObra" name="valorObra" value={formData.valorObra} onChange={handleChange} placeholder="R$ 0,00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="terminoObra" className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                <input type="text" id="terminoObra" name="terminoObra" value={formData.terminoObra} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed" placeholder="Calculado"/>
              </div>
            </div>
          </fieldset>
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" form="reclassification-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReclassificationModal;
