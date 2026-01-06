
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FilterIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, ListIcon, SparklesIcon } from './Icons';
import NewTipologiaModal from './NewTipologiaModal';
import EditTipologiaModal from './EditTipologiaModal';
import { MultiSelectDropdown } from './AdvancedFilters';

interface Tipologia {
  id: number;
  titulo: string;
  descricao: string;
  dataInclusao: string;
  criadoPor: string;
  status: boolean;
}

const initialTipologias: Tipologia[] = [
  { id: 1, titulo: 'Ambientes CQV', descricao: 'Adequações, construções...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 2, titulo: 'Climatização / exaustão', descricao: 'Projetos, instalações ou ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 3, titulo: 'Bloco anexo', descricao: 'Intervenções voltadas à ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 4, titulo: 'Reforma', descricao: 'reforma', dataInclusao: '05/11/2025 15:06', criadoPor: 'JULIA ANDRADE SILVA', status: false },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; label?: string }> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center cursor-pointer" onClick={onChange}>
      <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${checked ? 'bg-sky-500 after:translate-x-full' : 'bg-gray-200'}`}></div>
      <span className="ml-3 text-sm font-medium text-gray-400">{checked ? 'Ativo' : 'Inativo'}</span>
    </div>
  );
};


const TipologiaScreen: React.FC = () => {
  const [tipologias, setTipologias] = useState<Tipologia[]>(initialTipologias);

  useEffect(() => {
    fetch('/api/tipologias')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data) && data.length > 0) setTipologias(data);
      })
      .catch(err => console.error('Failed to fetch tipologias', err));
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // Advanced Filter State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTipologia, setEditingTipologia] = useState<Tipologia | null>(null);

  const handleToggleStatus = (id: number) => {
    setTipologias(prev => prev.map(t => t.id === id ? { ...t, status: !t.status } : t));
  };

  const handleSaveNewTipologia = (data: { titulo: string; descricao: string }) => {
    const newId = Math.max(...tipologias.map(t => t.id)) + 1;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newTipologia: Tipologia = {
        id: newId,
        titulo: data.titulo,
        descricao: data.descricao,
        dataInclusao: formattedDate,
        criadoPor: 'USUÁRIO ATUAL', // Mock user
        status: true
    };
    
    setTipologias(prev => [newTipologia, ...prev]);
    setIsNewModalOpen(false);
  };

  const handleEditClick = (tipologia: Tipologia) => {
    setEditingTipologia(tipologia);
    setIsEditModalOpen(true);
  };

  const handleSaveEditTipologia = (id: number, newDescription: string) => {
    setTipologias(prev => prev.map(t => t.id === id ? { ...t, descricao: newDescription } : t));
    setIsEditModalOpen(false);
    setEditingTipologia(null);
  };

  const handleApplyFilters = () => {
    setActiveStatusFilters(selectedStatus);
  };

  const handleClearFilters = () => {
    setSelectedStatus([]);
    setActiveStatusFilters([]);
  };

  const filteredTipologias = tipologias.filter(t => {
    const matchesSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (activeStatusFilters.length > 0) {
        const statusString = t.status ? 'Ativo' : 'Inativo';
        matchesStatus = activeStatusFilters.includes(statusString);
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
    <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Tipologias</h1>
            <button 
                onClick={() => setIsNewModalOpen(true)}
                className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
            >
                Nova Tipologia
            </button>
        </div>

        {/* Content Card */}
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={() => setShowAdvancedFilters(prev => !prev)}
                    className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                >
                    <FilterIcon className="w-5 h-5" />
                    <span>Filtros Avançados</span>
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="mb-6 p-6 border-t border-b border-gray-200">
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
                            onClick={handleClearFilters}
                            className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Limpar Filtros</span>
                        </button>
                        <button 
                            onClick={handleApplyFilters}
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
                            <th scope="col" className="px-6 py-4 font-semibold rounded-tl-lg">Título</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Descrição</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Data da Inclusão</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Criado Por</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center rounded-tr-lg">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTipologias.map((item) => (
                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.titulo}</td>
                                <td className="px-6 py-4">{item.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.dataInclusao}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.criadoPor}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ToggleSwitch checked={item.status} onChange={() => handleToggleStatus(item.id)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleEditClick(item)}
                                        className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
             <div className="flex items-center justify-end p-4 space-x-4">
                <div className="flex items-center space-x-2">
                    <button className="text-gray-400 disabled:cursor-not-allowed" disabled>
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white font-bold rounded-md text-sm">
                        1
                    </button>
                    <button className="text-gray-400 disabled:cursor-not-allowed" disabled>
                         <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
                <div>
                     <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
                    >
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <NewTipologiaModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveNewTipologia}
    />
    <EditTipologiaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tipologia={editingTipologia}
        onSave={handleSaveEditTipologia}
    />
    </>
  );
};

export default TipologiaScreen;
