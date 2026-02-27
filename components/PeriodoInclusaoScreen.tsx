
import React, { useState } from 'react';
import {
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  PencilIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from './Icons';
import { SolicitationPeriod } from '../types';

// Mock initial data
const INITIAL_PERIODS: SolicitationPeriod[] = [
  {
    id: 1,
    tipoServico: 'Estratégico',
    entidade: 'SENAI',
    dataInicio: '2024-05-02',
    dataFim: '2024-05-24',
    criadoPor: 'PAULO RIBEIRO',
    dataInclusao: '2024-04-20T10:00:00.000Z',
    ativo: true
  },
  {
    id: 2,
    tipoServico: 'Sede',
    entidade: 'SESI',
    dataInicio: '2024-05-06',
    dataFim: '2024-05-28',
    criadoPor: 'JULIA ANDRADE',
    dataInclusao: '2024-04-25T14:30:00.000Z',
    ativo: true
  }
];

const PeriodoInclusaoScreen: React.FC = () => {
  const [periods, setPeriods] = useState<SolicitationPeriod[]>(INITIAL_PERIODS);

  // Form State for New Entry
  const [tipoServico, setTipoServico] = useState<'Estratégico' | 'Operacional' | 'Sede' | ''>('');
  const [entidade, setEntidade] = useState<'SESI' | 'SENAI' | 'Corporativo' | ''>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SolicitationPeriod>>({});

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  };

  const clearForm = () => {
    setTipoServico('');
    setEntidade('');
    setDataInicio('');
    setDataFim('');
  };

  const handleSaveNew = () => {
    if (!tipoServico || !entidade || !dataInicio || !dataFim) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const newPeriod: SolicitationPeriod = {
      id: Date.now(),
      tipoServico: tipoServico as any,
      entidade: entidade as any,
      dataInicio,
      dataFim,
      criadoPor: 'USUÁRIO ATUAL', // Mock
      dataInclusao: new Date().toISOString(),
      ativo: true
    };
    setPeriods(prev => [newPeriod, ...prev]);
    showToast('Período cadastrado com sucesso.', 'success');
    clearForm();
  };

  const toggleCardStatus = (id: number) => {
    setPeriods(prev => prev.map(p => p.id === id ? {
      ...p,
      ativo: !p.ativo,
      alteradoPor: 'USUÁRIO ATUAL',
      dataAlteracao: new Date().toISOString()
    } as SolicitationPeriod : p));
  };

  const startEditing = (period: SolicitationPeriod) => {
    setEditingId(period.id);
    setEditFormData({
      tipoServico: period.tipoServico,
      entidade: period.entidade,
      dataInicio: period.dataInicio,
      dataFim: period.dataFim
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const saveEditing = (id: number) => {
    setPeriods(prev => prev.map(p => p.id === id ? {
      ...p,
      ...editFormData,
      alteradoPor: 'USUÁRIO ATUAL',
      dataAlteracao: new Date().toISOString()
    } as SolicitationPeriod : p));
    setEditingId(null);
    setEditFormData({});
    showToast('Período atualizado com sucesso.', 'success');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderCard = (period: SolicitationPeriod) => {
    const isEditing = editingId === period.id;

    if (isEditing) {
      return (
        <div key={period.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 relative transition-all ring-2 ring-yellow-400 ring-opacity-50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo de Serviço</label>
              <select
                value={editFormData.tipoServico}
                onChange={(e) => setEditFormData({ ...editFormData, tipoServico: e.target.value as any })}
                className="w-full text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Estratégico">Estratégico</option>
                <option value="Operacional">Operacional</option>
                <option value="Sede">Sede</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Entidade</label>
              <select
                value={editFormData.entidade}
                onChange={(e) => setEditFormData({ ...editFormData, entidade: e.target.value as any })}
                className="w-full text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="SESI">SESI</option>
                <option value="SENAI">SENAI</option>
                <option value="Corporativo">Corporativo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Início</label>
              <input
                type="date"
                value={editFormData.dataInicio}
                onChange={(e) => setEditFormData({ ...editFormData, dataInicio: e.target.value })}
                className="w-full text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fim</label>
              <input
                type="date"
                value={editFormData.dataFim}
                onChange={(e) => setEditFormData({ ...editFormData, dataFim: e.target.value })}
                className="w-full text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
              <button onClick={cancelEditing} className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 rounded">
                <XMarkIcon className="w-5 h-5" />
              </button>
              <button onClick={() => saveEditing(period.id)} className="p-1 text-white bg-green-600 hover:bg-green-700 rounded">
                <CheckIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={period.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${period.ativo !== false ? 'border-[#0E4F8F]' : 'border-gray-400'} hover:shadow-lg transition-shadow group relative opacity-${period.ativo !== false ? '100' : '60'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center justify-between">
              {period.tipoServico}
              {/* Toggle Button */}
              <div className="flex items-center ml-4 mt-0">
                <div
                  onClick={(e) => { e.stopPropagation(); toggleCardStatus(period.id); }}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${period.ativo !== false ? 'bg-[#009EE3]' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${period.ativo !== false ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-2 text-xs font-medium text-[#009EE3] whitespace-nowrap">
                  {period.ativo !== false ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
              {period.entidade}
            </span>
          </div>
          <button
            onClick={() => startEditing(period)}
            className="text-gray-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
            title="Editar"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Início:</span>
            <span className="ml-2">{formatDate(period.dataInicio)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Fim:</span>
            <span className="ml-2">{formatDate(period.dataFim)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <UserIcon className="w-3 h-3 mr-1.5" />
            <span className="truncate max-w-[150px]">Resp: <span className="font-medium text-gray-700">{period.alteradoPor || period.criadoPor}</span></span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-3 h-3 mr-1.5" />
            <span>{period.dataAlteracao ? 'Alt:' : 'Cri:'} {formatDateTime(period.dataAlteracao || period.dataInclusao)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Group periods by entity for columns
  const sesiPeriods = periods.filter(p => p.entidade === 'SESI');
  const senaiPeriods = periods.filter(p => p.entidade === 'SENAI');
  const otherPeriods = periods.filter(p => p.entidade !== 'SESI' && p.entidade !== 'SENAI');

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header - standard style matching UnitsScreen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Período Inclusão</h1>
      </div>

      {/* Exposed Form Area (Advanced Filters Style) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Serviço</label>
            <select
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">Selecione...</option>
              <option value="Estratégico">Estratégico</option>
              <option value="Operacional">Operacional</option>
              <option value="Sede">Sede</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Entidade</label>
            <select
              value={entidade}
              onChange={(e) => setEntidade(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">Selecione...</option>
              <option value="SESI">SESI</option>
              <option value="SENAI">SENAI</option>
              <option value="Corporativo">Corporativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={clearForm}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors text-sm"
          >
            Limpar
          </button>
          <button
            onClick={handleSaveNew}
            className="px-6 py-2 bg-[#0E4F8F] text-white rounded-md hover:bg-opacity-90 font-medium transition-colors shadow-sm text-sm"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Cards Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: SESI */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">SESI</h2>
          <div className="space-y-4">
            {sesiPeriods.map(renderCard)}
            {sesiPeriods.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum período.</p>}
          </div>
        </div>

        {/* Column 2: SENAI */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">SENAI</h2>
          <div className="space-y-4">
            {senaiPeriods.map(renderCard)}
            {senaiPeriods.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum período.</p>}
          </div>
        </div>

        {/* Column 3: Corporativo (or Operacional if mislabeled by user, but adhering to Entity structure) */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">Corporativo / Outros</h2>
          <div className="space-y-4">
            {otherPeriods.map(renderCard)}
            {otherPeriods.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum período.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodoInclusaoScreen;
