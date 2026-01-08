
import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FilterIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from './Icons';
import TipoLocalModal from './TipoLocalModal';
import ConfirmationModal from './ConfirmationModal';
import { MultiSelectDropdown } from './AdvancedFilters';
import { TipoLocal } from '../types';

interface TipoLocalScreenProps {
  tipoLocais: TipoLocal[];
  setTipoLocais: React.Dispatch<React.SetStateAction<TipoLocal[]>>;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div className="flex items-center cursor-pointer" onClick={onChange}>
    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-[#0EA5E9]' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
    <span className="ml-3 text-sm font-medium text-gray-500">{checked ? 'Ativo' : 'Inativo'}</span>
  </div>
);

const TipoLocalScreen: React.FC<TipoLocalScreenProps> = ({ tipoLocais, setTipoLocais }) => {
  const [items, setItems] = useState<TipoLocal[]>(tipoLocais);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoLocal | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<TipoLocal | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  };

  const handleToggleRequest = (item: TipoLocal) => {
    setPendingToggle(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingToggle) {
      try {
        const response = await fetch('/api/tipo-locais', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pendingToggle.id,
            status: !pendingToggle.status
          })
        });

        if (response.ok) {
          const updated = await response.json();
          const isReactivating = updated.status;
          setItems(prev => prev.map(i => i.id === pendingToggle.id ? updated : i));
          showToast(isReactivating ? 'Tipo Local reativado com sucesso.' : 'Tipo Local inativado com sucesso.', 'success');
        } else {
          showToast('Erro ao atualizar status no servidor.', 'error');
        }
      } catch (error) {
        console.error("Failed to toggle status", error);
        showToast('Erro de conexão ao atualizar status.', 'error');
      }
    }
    setIsConfirmOpen(false);
    setPendingToggle(null);
  };

  const handleSave = async (descricao: string) => {
    // Check uniqueness locally first (optional, DB constraint better)
    const exists = items.some(i => i.descricao.toLowerCase() === descricao.toLowerCase() && (!editingItem || i.id !== editingItem.id));
    if (exists) {
      showToast('Operação não efetuada. Já existe um Tipo Local cadastrado com este nome.', 'error');
      return;
    }

    try {
      if (editingItem) {
        // Edit
        const response = await fetch('/api/tipo-locais', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            descricao
          })
        });

        if (response.ok) {
          const updated = await response.json();
          setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
          showToast('Tipo Local atualizado com sucesso.', 'success');
        } else {
          showToast('Erro ao atualizar Tipo Local.', 'error');
        }

      } else {
        // Create
        const response = await fetch('/api/tipo-locais', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descricao,
            dataInclusao: new Date().toISOString(),
            criadoPor: 'PAULO RIBEIRO', // Mock
            status: true
          })
        });

        if (response.ok) {
          const newItem = await response.json();
          setItems(prev => [newItem, ...prev]);
          showToast('Tipo Local cadastrado com sucesso.', 'success');
        } else {
          showToast('Erro ao cadastrar Tipo Local.', 'error');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Erro de conexão com o servidor.', 'error');
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.criadoPor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeStatusFilters.length === 0 ||
        (i.status ? activeStatusFilters.includes('Ativo') : activeStatusFilters.includes('Inativo'));
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, activeStatusFilters]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tipo Local</h1>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
        >
          Novo Tipo Local
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative max-w-lg w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Procurar..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
          >
            <FilterIcon className="w-5 h-5" />
            <span>Filtros Avançados</span>
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mb-6 p-6 border-t border-b border-gray-200 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2 mb-6">
              <ListIcon className="w-6 h-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Filtros avançados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MultiSelectDropdown
                label="Status:"
                options={['Ativo', 'Inativo']}
                selectedValues={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Filtre por Status"
              />
            </div>
            <div className="flex justify-end items-center mt-6 space-x-4">
              <button
                onClick={() => { setSelectedStatus([]); setActiveStatusFilters([]); }}
                className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
              <button
                onClick={() => { setActiveStatusFilters(selectedStatus); setCurrentPage(1); }}
                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors"
              >
                <FilterIcon className="w-5 h-5" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-lg">Descrição</th>
                <th className="px-6 py-4 font-semibold">Data da Inclusão</th>
                <th className="px-6 py-4 font-semibold">Criado Por</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors align-middle">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.dataInclusao}</td>
                  <td className="px-6 py-4 whitespace-nowrap uppercase">{item.criadoPor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ToggleSwitch checked={item.status} onChange={() => handleToggleRequest(item)} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors shadow-md"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-400 italic">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end p-4 space-x-4 border-t mt-4">
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 text-gray-400 disabled:opacity-30"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white font-bold rounded-md text-sm">
              {currentPage}
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 text-gray-400 disabled:opacity-30"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <TipoLocalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialValue={editingItem?.descricao}
        isEditing={!!editingItem}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title="Confirmação"
        message={pendingToggle?.status
          ? `Deseja realmente inativar esse Tipo Local?`
          : `Deseja realmente reativar esse Tipo Local?`
        }
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </div>
  );
};

export default TipoLocalScreen;
