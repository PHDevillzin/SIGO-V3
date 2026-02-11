
import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FilterIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon, 
  TrashIcon,
  PaperClipIcon
} from './Icons';
import ConfirmationModal from './ConfirmationModal';
import { MultiSelectDropdown } from './AdvancedFilters';
import { AvisoGlobal, AccessProfile } from '../types';

interface GerenciamentoAvisosScreenProps {
  avisos: AvisoGlobal[];
  setAvisos: React.Dispatch<React.SetStateAction<AvisoGlobal[]>>;
  profiles: AccessProfile[];
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div className="flex items-center cursor-pointer" onClick={onChange}>
    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-[#0EA5E9]' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
    <span className="ml-3 text-sm font-medium text-gray-500">{checked ? 'Ativo' : 'Inativo'}</span>
  </div>
);

const GerenciamentoAvisosScreen: React.FC<{ profiles: AccessProfile[] }> = ({ profiles }) => {
  const [items, setItems] = useState<AvisoGlobal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AvisoGlobal | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<AvisoGlobal | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

  // New/Edit Modal Local State
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalDescricao, setModalDescricao] = useState('');
  const [modalDataInicio, setModalDataInicio] = useState('');
  const [modalDataFim, setModalDataFim] = useState('');
  const [modalPerfis, setModalPerfis] = useState<string[]>([]);

  const fetchAvisos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/avisos');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        showToast('Erro ao carregar avisos.', 'error');
      }
    } catch (error) {
      console.error('Error fetching avisos:', error);
      showToast('Erro ao carregar avisos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvisos();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  };

  const handleToggleRequest = (item: AvisoGlobal) => {
    setPendingToggle(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingToggle) {
        try {
            const res = await fetch('/api/avisos', {
                method: 'PUT', // Or PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pendingToggle, status: !pendingToggle.status })
            });

            if (res.ok) {
                const updatedItem = await res.json();
                setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
                showToast(updatedItem.status ? 'Aviso reativado com sucesso.' : 'Aviso inativado com sucesso.', 'success');
            } else {
                showToast('Erro ao atualizar status.', 'error');
            }
        } catch (error) {
             console.error('Error toggling status:', error);
             showToast('Erro ao atualizar status.', 'error');
        }
    }
    setIsConfirmOpen(false);
    setPendingToggle(null);
  };

  const openModal = (item?: AvisoGlobal) => {
      if (item) {
          setEditingItem(item);
          setModalTitulo(item.titulo);
          setModalDescricao(item.descricao);
          setModalDataInicio(item.dataInicio ? new Date(item.dataInicio).toISOString().slice(0, 16) : '');
          setModalDataFim(item.dataFim ? new Date(item.dataFim).toISOString().slice(0, 16) : '');
          setModalPerfis(item.perfis || []);
      } else {
          setEditingItem(null);
          setModalTitulo('');
          setModalDescricao('');
          setModalDataInicio('');
          setModalDataFim('');
          setModalPerfis([]);
      }
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
  };

  const handleSave = async () => {
      if (!modalDataInicio || !modalDataFim || !modalDescricao || !modalTitulo) {
          alert('Por favor, preencha todos os campos obrigatórios (Título, Detalhes, Data Início, Data Fim).');
          return;
      }
      
      const payload = {
          titulo: modalTitulo,
          descricao: modalDescricao,
          perfis: modalPerfis,
          dataInicio: new Date(modalDataInicio).toISOString(),
          dataFim: new Date(modalDataFim).toISOString(),
          criadoPor: 'USUÁRIO ATUAL', // Replace with actual user context if available, or fetch from session
          editadoPor: 'USUÁRIO ATUAL',
          responsavel: 'USUÁRIO ATUAL',
          status: true
      };

      try {
          let res;
          if (editingItem) {
               res = await fetch('/api/avisos', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...payload, id: editingItem.id, status: editingItem.status })
              });
          } else {
              res = await fetch('/api/avisos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });
          }

          if (res.ok) {
              const savedItem = await res.json();
              if (editingItem) {
                  setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
                  showToast('Aviso atualizado com sucesso!', 'success');
              } else {
                  setItems(prev => [savedItem, ...prev]);
                  showToast('Aviso criado com sucesso!', 'success');
              }
              closeModal();
          } else {
              showToast('Erro ao salvar aviso.', 'error');
          }
      } catch (error) {
          console.error('Error saving aviso:', error);
          showToast('Erro ao salvar aviso.', 'error');
      }
  };


  // --- Filtering Logic ---
  const currentItems = items.filter(item => {
      const matchesSearch = 
        (item.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = activeStatusFilters.length === 0 || 
        (activeStatusFilters.includes('Ativo') && item.status) ||
        (activeStatusFilters.includes('Inativo') && !item.status);

      return matchesSearch && matchesStatus;
  }).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const profileOptions = ['Todos', ...profiles.map(p => p.name)];

  const renderPerfis = (item: AvisoGlobal) => {
      if (!item.perfis || item.perfis.length === 0) return <span className="text-gray-400 italic">Todos</span>;
      if (item.perfis.length <= 2) return item.perfis.join(', ');
      return (
          <div className="group relative">
              <span>{item.perfis.slice(0, 2).join(', ')} <span className="text-xs text-blue-500 font-bold">+{item.perfis.length - 2}</span></span>
              <div className="hidden group-hover:block absolute z-10 bg-black text-white text-xs rounded p-2 bottom-full left-0 mb-1 w-48 break-words shadow-lg">
                  {item.perfis.join(', ')}
              </div>
          </div>
      );
  };

  const renderResponsavel = (item: AvisoGlobal) => {
     return (
         <div className="flex flex-col">
             <span className="font-medium text-gray-900">{item.responsavel || item.criadoPor || '-'}</span>
             {item.editadoPor && item.editadoPor !== item.criadoPor && (
                 <span className="text-xs text-gray-400">Ed: {item.editadoPor}</span>
             )}
         </div>
     );
  };
  
  const formatDate = (isoString?: string) => {
      if (!isoString) return '-';
      return new Date(isoString).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
        {/* Toast Notification */}
        {toast && toast.isVisible && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300`}>
                {toast.message}
            </div>
        )}

        {/* ... (Header and Filters kept mostly same, ensuring props use local state) ... */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Avisos</h1>
             <p className="text-sm text-gray-500">Configure avisos globais para os usuários do sistema.</p>
           </div>
           <button
             onClick={() => openModal()}
             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0E4F8F] hover:bg-[#0c447a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           >
             <PencilIcon className="w-4 h-4 mr-2" />
             Cadastrar
           </button>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 text-sm"> {/* Reduced text size */}
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" // Reduced padding/text
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* ... Advanced Filters Toggle ... */}
            <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
              >
                <FilterIcon className="w-5 h-5" />
                <span>Filtros Avançados</span>
            </button>
          </div>
        
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
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
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Início
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Fim
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado/Editado
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                  <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          Carregando avisos...
                      </td>
                  </tr>
              ) : currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.titulo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.descricao}>
                    {item.descricao}
                  </td>
                   <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.perfis?.join(', ')}>
                    {renderPerfis(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.dataInicio)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.dataFim)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div className="flex flex-col">
                        <span>{formatDate(item.dataInclusao)}</span>
                        {item.dataAlteracao && <span className="text-xs text-gray-400">Alt: {formatDate(item.dataAlteracao)}</span>}
                     </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {renderResponsavel(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ToggleSwitch checked={item.status} onChange={() => handleToggleRequest(item)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <button 
                         onClick={() => openModal(item)}
                         className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors shadow-md"
                         title="Editar"
                     >
                         <PencilIcon className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {!isLoading && currentItems.length === 0 && (
                <tr>
                   <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                          <InformationCircleIcon className="w-12 h-12 text-gray-300 mb-2" />
                          <p>Nenhum aviso encontrado.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination logic here... (omitted for brevity, keep existing) */}
        {totalPages > 1 && (
             <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                {/* ... pagination controls ... */}
                <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Próximo</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, items.length)}</span> de <span className="font-medium">{items.length}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <span className="sr-only">Anterior</span>
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <span className="sr-only">Próximo</span>
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
             </div>
        )}
      </div>

      {/* Modal and Confirm Dialog (Keep existing structure, just updated handlers) */}
      {isModalOpen && (
           <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
               <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                   <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
                   <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                   <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
                       <div className="bg-white px-8 py-8">
                           {/* Modal Header */}
                           <div className="mb-6">
                               <h3 className="text-2xl font-bold text-gray-900">
                                   Configuração de Avisos Globais
                               </h3>
                           </div>

                           {/* Período de Exibição do Aviso Card */}
                           <div className="border border-gray-200 rounded-lg p-6 mb-6">
                               <div className="flex items-center space-x-2 text-indigo-900 font-semibold mb-6">
                                    <span className="text-lg">Período de Exibição do Aviso</span>
                                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                    <div className="relative">
                                        <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                                            <span className="mr-2">📅</span> Data de Início
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="dataInicio"
                                            className="block w-full border border-gray-300 rounded-md py-2.5 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                                            value={modalDataInicio}
                                            onChange={(e) => setModalDataInicio(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="dataFim" className="block text-sm font-medium text-gray-500 mb-1">
                                             Data de Fim
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="datetime-local"
                                                id="dataFim"
                                                className="block w-full border border-gray-300 rounded-md py-2.5 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                                                value={modalDataFim}
                                                onChange={(e) => setModalDataFim(e.target.value)}
                                            />
                                        </div>
                                    </div>
                               </div>

                                <div className="mb-2">
                                    <MultiSelectDropdown
                                        label="Perfis de Acesso (Quem verá este aviso)"
                                        options={profileOptions}
                                        selectedValues={modalPerfis}
                                        onChange={setModalPerfis}
                                        placeholder="Selecione os perfis..."
                                    />
                                </div>
                           </div>

                           {/* Mensagem do Aviso Section */}
                           <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Mensagem do Aviso</h4>
                                {/* Rich Text Toolbar */}
                                <div className="border border-gray-300 rounded-t-lg bg-white p-2 flex items-center flex-wrap gap-2 border-b-0 space-x-1">
                                    {/* Font Family */}
                                    <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-500 max-w-[150px]">
                                        <option>Aptos (Corpo)</option>
                                        <option>Arial</option>
                                        <option>Times New Roman</option>
                                    </select>
                                    
                                    {/* Font Size */}
                                    <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-500 w-16">
                                        <option>11</option>
                                        <option>12</option>
                                        <option>14</option>
                                    </select>

                                    <div className="h-5 w-px bg-gray-300 mx-2"></div>

                                    {/* Styles */}
                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-700 font-bold" title="Negrito">
                                        N
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-700 italic font-serif" title="Itálico">
                                        I
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-700 underline underline-offset-2" title="Sublinhado">
                                        S
                                    </button>

                                    <div className="h-5 w-px bg-gray-300 mx-1"></div>

                                    {/* Colors */}
                                    <button className="p-1 hover:bg-gray-100 rounded flex flex-col items-center justify-center group" title="Cor do Realce">
                                        <PencilIcon className="w-4 h-4 text-gray-700" />
                                        <div className="w-4 h-1 bg-yellow-400 mt-0.5"></div>
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded flex flex-col items-center justify-center group" title="Cor da Fonte">
                                        <span className="text-sm font-bold leading-none text-gray-700">A</span>
                                        <div className="w-4 h-1 bg-red-600 mt-0.5"></div>
                                    </button>
                                </div>
                                <div className="border border-gray-300 rounded-b-lg p-4 bg-gray-50">
                                     <input 
                                        type="text" 
                                        placeholder="Título (opcional/interno)" 
                                        value={modalTitulo}
                                        onChange={(e) => setModalTitulo(e.target.value)}
                                        className="w-full mb-3 bg-transparent border-0 border-b border-gray-200 focus:ring-0 text-gray-900 font-bold placeholder-gray-400 px-0"
                                     />
                                     <textarea
                                        rows={4}
                                        className="w-full bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 px-0 resize-none"
                                        value={modalDescricao}
                                        onChange={(e) => setModalDescricao(e.target.value)}
                                        placeholder="Digite a mensagem do aviso aqui..."
                                     />
                                </div>
                           </div>
                       </div>
                       <div className="bg-gray-50 px-8 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
                           <button
                               type="button"
                               className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2.5 bg-[#0E4F8F] text-base font-medium text-white hover:bg-[#0c447a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                               onClick={handleSave}
                           >
                               Salvar
                           </button>
                           <button
                               type="button"
                               className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                               onClick={closeModal}
                           >
                               Cancelar
                           </button>
                       </div>
                   </div>
               </div>
           </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={pendingToggle?.status ? 'Inativar Aviso' : 'Reativar Aviso'}
        message={`Tem certeza que deseja ${pendingToggle?.status ? 'inativar' : 'reativar'} o aviso "${pendingToggle?.titulo}"?`}
        confirmLabel={pendingToggle?.status ? 'Inativar' : 'Reativar'}
        cancelLabel="Cancelar"
      />
    </div>
  );
};


export default GerenciamentoAvisosScreen;
