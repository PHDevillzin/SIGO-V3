
import React, { useState, useMemo } from 'react';
import { Unit } from '../types';
import { 
    MagnifyingGlassIcon, 
    FilterIcon, 
    EyeIcon, 
    PencilIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    SparklesIcon 
} from './Icons';
import UnitDetailsModal from './UnitDetailsModal';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';

const mockUnits: Unit[] = [
    {
        id: 1,
        codigoUnidade: 'Complexo Cultural',
        entidade: 'SESI',
        tipo: 'CAT',
        centro: '1031',
        cat: '1031 CAT Mario Amato - Ermelino Matarazzo',
        unidade: 'Complexo Cultural Itaquera SESI SENAI',
        cidade: 'São Paulo - Itaquera',
        bairro: 'Artur Alvim',
        endereco: 'Av. Miguel Ignácio Curi, s/nº',
        cep: '08295-005',
        re: 'RE01',
        responsavelRE: 'Renata Caparroz',
        ra: 'RA01',
        responsavelRA: 'Heber Turquetti',
        responsavelRAR: 'Wellington Rodrigues',
        tipoDeUnidade: 'Própria',
        unidadeResumida: 'Complexo Cultural',
        gerenteRegional: 'Silvia Simoni Orlando',
        emailGR: 'silviasimoni@sesisp.org.br',
        site: 'https://itaquera.sesisp.org.br/complexo-cultural',
        latitude: '-23.5329',
        longitude: '-46.6395'
    },
    {
        id: 2,
        codigoUnidade: 'ESC - Atibaia',
        entidade: 'SESI',
        tipo: 'Estação de Cultura',
        centro: '1234',
        cat: '1045 CAT Morvan Dias de Figueiredo - Guarulhos',
        unidade: 'Estação SESI de Cultura - Atibaia',
        cidade: 'Atibaia',
        bairro: 'Jardim das Cerejeiras',
        endereco: 'Rua da Meca, nº 360',
        cep: '12951-300',
        re: 'RE06',
        responsavelRE: 'Lucas Attili',
        ra: 'RA02',
        responsavelRA: 'Alexandra Frasson',
        responsavelRAR: 'Júlio Cezar Martins',
        tipoDeUnidade: 'Própria',
        unidadeResumida: 'Cultura Atibaia',
        gerenteRegional: "Carlos Frederico D'Avila de Brito",
        emailGR: 'cbrito@sesisp.org.br',
        site: 'https://atibaia-cultura.sesisp.org.br/',
        latitude: '-23.1171',
        longitude: '-46.5563'
    },
    {
        id: 3,
        codigoUnidade: '1.01',
        entidade: 'SENAI',
        tipo: 'CFP',
        centro: '2002',
        cat: '-',
        unidade: '1.01 Brás - Roberto Simonsen',
        cidade: 'São Paulo - Brás',
        bairro: 'Brás',
        endereco: 'Rua Monsenhor Andrade, nº 298',
        cep: '03008-000',
        re: 'RE03',
        responsavelRE: 'Thiago Romano',
        ra: 'RA01',
        responsavelRA: 'Heber Turquetti',
        responsavelRAR: 'Wellington Rodrigues',
        tipoDeUnidade: 'Própria',
        unidadeResumida: '1.01 Brás',
        gerenteRegional: '-',
        emailGR: '-',
        site: 'https://bras.sp.senai.br/',
        latitude: '-23.5329',
        longitude: '-46.6395'
    },
    {
        id: 4,
        codigoUnidade: '3.01',
        entidade: 'SENAI',
        tipo: 'CFP',
        centro: '2035',
        cat: '-',
        unidade: '3.01 Taubaté - Felix Guisard',
        cidade: 'Taubaté',
        bairro: 'Independência',
        endereco: 'Avenida Independência, nº 846',
        cep: '12031-001',
        re: 'RE07',
        responsavelRE: 'Bruno Lopes',
        ra: 'RA02',
        responsavelRA: 'Alexandra Frasson',
        responsavelRAR: 'Júlio Cezar Martins',
        tipoDeUnidade: 'Própria',
        unidadeResumida: '3.01 Taubaté',
        gerenteRegional: '-',
        emailGR: '-',
        site: 'https://taubate.sp.senai.br/',
        latitude: '-23.0104',
        longitude: '-45.5593'
    },
    {
        id: 5,
        codigoUnidade: '8001',
        entidade: 'SESI',
        tipo: 'CAT',
        centro: '1042',
        cat: '1042 CAT Dr. Paulo de Castro Correia - Santos',
        unidade: 'CAT Santos (Jardim Santa Maria) - Dr. Paulo de Castro Correia',
        cidade: 'Santos',
        bairro: 'Santa Maria',
        endereco: 'Avenida Nossa Senhora de Fátima, nº 366',
        cep: '11085-200',
        re: 'RE05',
        responsavelRE: 'Luan Souza',
        ra: 'RA02',
        responsavelRA: 'Alexandra Frasson',
        responsavelRAR: 'Júlio Cezar Martins',
        tipoDeUnidade: 'Própria',
        unidadeResumida: 'CAT Santos',
        gerenteRegional: 'Mário Sergio Alves Quaranta',
        emailGR: 'mquaranta@sesisp.org.br',
        site: 'https://santos.sesisp.org.br/',
        latitude: '-23.9535',
        longitude: '-46.335'
    }
];

const UnitsScreen: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>(mockUnits);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<AdvancedFiltersState | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

    const filteredUnits = useMemo(() => {
        let result = units;
        
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(u => 
                u.unidade.toLowerCase().includes(lower) || 
                u.cidade.toLowerCase().includes(lower) || 
                u.codigoUnidade.toLowerCase().includes(lower)
            );
        }

        if (activeFilters) {
            if (activeFilters.entidades && activeFilters.entidades.length > 0) {
                result = result.filter(u => activeFilters.entidades?.includes(u.entidade));
            }
        }
        
        return result;
    }, [units, searchTerm, activeFilters]);

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenModal = (unit: Unit | null, mode: 'view' | 'edit' | 'create') => {
        setSelectedUnit(unit);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleSaveUnit = (unitData: any) => {
        if (modalMode === 'create') {
            const newUnit = { ...unitData, id: Date.now() };
            setUnits(prev => [newUnit, ...prev]);
        } else {
            setUnits(prev => prev.map(u => u.id === unitData.id ? unitData : u));
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Unidades</h1>
                <button 
                    onClick={() => handleOpenModal(null, 'create')}
                    className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                >
                    Cadastrar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex justify-between items-center space-x-4">
                    <div className="relative flex-grow max-w-sm">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Procurar unidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    <AdvancedFilters 
                        onFilter={setActiveFilters} 
                        activeFilters={activeFilters}
                        hideSituacao
                        hideTipologia
                    />
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">Código Unidade</th>
                                <th className="px-4 py-3 whitespace-nowrap">Entidade</th>
                                <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
                                <th className="px-4 py-3 whitespace-nowrap">Centro</th>
                                <th className="px-4 py-3 whitespace-nowrap">CAT</th>
                                <th className="px-4 py-3 whitespace-nowrap">Unidade</th>
                                <th className="px-4 py-3 whitespace-nowrap">Cidade</th>
                                <th className="px-4 py-3 whitespace-nowrap">Responsável RE</th>
                                <th className="px-4 py-3 whitespace-nowrap">RA</th>
                                <th className="px-4 py-3 whitespace-nowrap">Responsável RA</th>
                                <th className="px-4 py-3 whitespace-nowrap">Responsável RAR</th>
                                <th className="px-4 py-3 whitespace-nowrap">Tipo de Unidade</th>
                                <th className="px-4 py-3 text-center sticky right-0 bg-[#0B1A4E]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedUnits.map(unit => (
                                <tr key={unit.id} className="hover:bg-gray-50 transition-colors text-xs">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{unit.codigoUnidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.entidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipo}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.centro}</td>
                                    <td className="px-4 py-4 whitespace-nowrap max-w-xs truncate" title={unit.cat}>{unit.cat}</td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 max-w-xs truncate" title={unit.unidade}>{unit.unidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.cidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRE}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.ra}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRA}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRAR}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipoDeUnidade}</td>
                                    <td className="px-4 py-4 text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(unit, 'view')}
                                                className="p-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                                                title="Visualizar"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenModal(unit, 'edit')}
                                                className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                                                title="Editar"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUnits.length === 0 && (
                                <tr>
                                    <td colSpan={13} className="px-4 py-10 text-center text-gray-500 italic">
                                        Nenhuma unidade encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white font-bold rounded-full text-sm">
                            {currentPage}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">
                        Página {currentPage} de {totalPages || 1}
                    </span>
                </div>
            </div>

            <UnitDetailsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                unit={selectedUnit}
                mode={modalMode}
                onSave={handleSaveUnit}
            />
        </div>
    );
};

export default UnitsScreen;
