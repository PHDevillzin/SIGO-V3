
import React, { useState, useMemo, useEffect } from 'react';
import MonthlySummaryModal from './MonthlySummaryModal';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';
import { MagnifyingGlassIcon, FilterIcon, ArrowsUpDownIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, EyeIcon, PencilIcon, BanknotesIcon } from './Icons';
import ProjectWorkDataModal from './ProjectWorkDataModal';
import PlurianualDetailsModal from './PlurianualDetailsModal';
import { Criticality, PlanningData } from '../types';

const planningData: PlanningData[] = [
    { id: 1, criticidade: Criticality.MEDIA, ordem: 'SS-24-0102-O1', unidade: 'CE 114 - Agudos', descricao: 'Ampliação de 03 salas de aula', situacaoObra: 'Concluída', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: true, inicioProjeto: '15/01/2024', saldoProjetoPrazo: 2, saldoProjetoValor: 'R$ 1.907.299,65', inicioObra: '15/03/2024', saldoObraPrazo: 3, saldoObraValor: 'R$ 1.812.699,83', terminoProjeto: '15/03/2024', terminoObra: '15/06/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Operacional', tipologia: 'Tipologia A' },
    { id: 2, criticidade: Criticality.MEDIA, ordem: 'SS-24-0102-O2', unidade: 'CE 114 - Agudos', descricao: 'Instalação de policarbonato', situacaoObra: 'Concluída', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: false, inicioProjeto: '20/02/2024', saldoProjetoPrazo: 1, saldoProjetoValor: 'R$ 72.050,05', inicioObra: '20/03/2024', saldoObraPrazo: 4, saldoObraValor: 'R$ 81.831,62', terminoProjeto: '20/03/2024', terminoObra: '20/07/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Manutenção', tipologia: 'Tipologia B' },
    { id: 3, criticidade: Criticality.MINIMA, ordem: 'SS-25-0127-P', unidade: 'CE 114 - Agudos', descricao: 'Climatização de ambientes', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '10/01/2025', saldoProjetoPrazo: 4, saldoProjetoValor: 'R$ 17.465,00', inicioObra: '10/05/2025', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00', terminoProjeto: '10/05/2025', terminoObra: 'N/A', empenho2026: 'R$ 8.732,50', empenho2027: 'R$ 8.732,50', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SESI', categoria: 'Baixa Complexidade', tipologia: 'Tipologia C' },
    { id: 4, criticidade: Criticality.MINIMA, ordem: 'SS-25-0127-O', unidade: 'CE 114 - Agudos', descricao: 'Climatização (obra)', situacaoObra: 'A Realizar', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/02/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 375.000,00', terminoProjeto: 'N/A', terminoObra: '01/06/2026', empenho2026: 'R$ 375.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SESI', categoria: 'Baixa Complexidade', tipologia: 'Tipologia C' },
    { id: 5, criticidade: Criticality.CRITICA, ordem: 'SS-25-2018-P', unidade: 'CE 114 - Agudos', descricao: 'Campo de futebol society', situacaoObra: 'Cancelada', situacaoProjeto: 'Cancelado', status: 'Cancelado', reclassified: false, inicioProjeto: '05/03/2025', saldoProjetoPrazo: 3, saldoProjetoValor: 'R$ 20.000,00', inicioObra: '05/06/2025', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00', terminoProjeto: '05/06/2025', terminoObra: 'N/A', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Estratégica', tipologia: 'Tipologia A' },
    { id: 6, criticidade: Criticality.CRITICA, ordem: 'SS-25-2018-O', unidade: 'CE 114 - Agudos', descricao: 'Campo de futebol (obra)', situacaoObra: 'Cancelada', situacaoProjeto: 'Cancelado', status: 'Cancelado', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/03/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 1.500.000,00', terminoProjeto: 'N/A', terminoObra: '01/09/2026', empenho2026: 'R$ 1.500.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Estratégica', tipologia: 'Tipologia A' },
    { id: 7, criticidade: Criticality.IMEDIATA, ordem: 'SS-24-10289-R', unidade: 'CE 114 - Agudos', descricao: 'Recuperação Ambiental TCRA', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Atenção', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '15/07/2024', saldoObraPrazo: 1, saldoObraValor: 'R$ 91.697,00', terminoProjeto: 'N/A', terminoObra: '15/08/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Intervenção Estratégica', tipologia: 'Tipologia D' },
    { id: 8, criticidade: Criticality.MINIMA, ordem: 'SS-24-6030-O', unidade: 'CE 114 - Agudos', descricao: 'Instalações hidráulicas e elétricas', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Atrasado', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/08/2024', saldoObraPrazo: 2, saldoObraValor: 'R$ 140.318,76', terminoProjeto: 'N/A', terminoObra: '01/10/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Manutenção', tipologia: 'Tipologia B' },
    { id: 9, criticidade: Criticality.MEDIA, ordem: 'SS-26-4010-P', unidade: 'CAT Tatuapé', descricao: 'Reforma da fachada', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: false, inicioProjeto: '10/02/2026', saldoProjetoPrazo: 3, saldoProjetoValor: 'R$ 50.000,00', inicioObra: '10/05/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 450.000,00', terminoProjeto: '10/05/2026', terminoObra: '10/10/2026', empenho2026: 'R$ 500.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Operacional', tipologia: 'Tipologia A' },
    { id: 10, criticidade: Criticality.CRITICA, ordem: 'SS-27-1120-O', unidade: 'Sede', descricao: 'Construção Anexo II', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '15/06/2027', saldoObraPrazo: 12, saldoObraValor: 'R$ 12.000.000,00', terminoProjeto: 'N/A', terminoObra: '15/06/2028', empenho2026: 'R$ 0,00', empenho2027: 'R$ 6.000.000,00', empenho2028: 'R$ 6.000.000,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SESI', categoria: 'Nova Unidade', tipologia: 'Tipologia D' },
    { id: 11, criticidade: Criticality.IMEDIATA, ordem: 'SS-28-0015-R', unidade: 'CE 055 - Osasco', descricao: 'Reparo emergencial telhado', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/01/2028', saldoObraPrazo: 2, saldoObraValor: 'R$ 250.000,00', terminoProjeto: 'N/A', terminoObra: '01/03/2028', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 250.000,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Manutenção', tipologia: 'Tipologia B' },
    { id: 12, criticidade: Criticality.MINIMA, ordem: 'SS-29-3030-P', unidade: 'CAT Campinas', descricao: 'Pintura externa prédio B', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '20/03/2029', saldoProjetoPrazo: 1, saldoProjetoValor: 'R$ 5.000,00', inicioObra: '20/04/2029', saldoObraPrazo: 3, saldoObraValor: 'R$ 120.000,00', terminoProjeto: '20/04/2029', terminoObra: '20/07/2029', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 125.000,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Operacional', tipologia: 'Tipologia A' },
    { id: 13, criticidade: Criticality.MEDIA, ordem: 'SS-30-5555-O', unidade: 'CE 201 - Itaquera', descricao: 'Reforma elétrica geral', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '05/08/2030', saldoObraPrazo: 8, saldoObraValor: 'R$ 850.000,00', terminoProjeto: 'N/A', terminoObra: '05/04/2031', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 850.000,00', entidade: 'SESI', categoria: 'Reforma Operacional', tipologia: 'Tipologia B' },
    { id: 14, criticidade: Criticality.CRITICA, ordem: 'SS-26-9100-P', unidade: 'CAT Sertãozinho', descricao: 'Ampliação de laboratórios', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '11/11/2026', saldoProjetoPrazo: 4, saldoProjetoValor: 'R$ 150.000,00', inicioObra: '11/03/2027', saldoObraPrazo: 9, saldoObraValor: 'R$ 2.300.000,00', terminoProjeto: '11/03/2027', terminoObra: '11/12/2027', empenho2026: 'R$ 150.000,00', empenho2027: 'R$ 2.300.000,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Reforma Estratégica', tipologia: 'Tipologia C' },
    { id: 15, criticidade: Criticality.MINIMA, ordem: 'SS-27-8020-O', unidade: '1.01 Brás', descricao: 'Manutenção de calçadas', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Atenção', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '20/09/2027', saldoObraPrazo: 2, saldoObraValor: 'R$ 80.000,00', terminoProjeto: 'N/A', terminoObra: '20/11/2027', empenho2026: 'R$ 0,00', empenho2027: 'R$ 80.000,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00', entidade: 'SENAI', categoria: 'Manutenção', tipologia: 'Tipologia D' },
    { id: 16, criticidade: Criticality.MEDIA, ordem: 'SS-28-7777-P', unidade: 'CE 342 - Jundiaí', descricao: 'Projeto de acessibilidade', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '14/07/2028', saldoProjetoPrazo: 5, saldoProjetoValor: 'R$ 95.000,00', inicioObra: '14/12/2028', saldoObraPrazo: 6, saldoObraValor: 'R$ 900.000,00', terminoProjeto: '14/12/2028', terminoObra: '14/06/2029', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 95.000,00', empenho2029: 'R$ 900.000,00', empenho2030: 'R$ 0,00', entidade: 'SESI', categoria: 'Reforma Operacional', tipologia: 'Tipologia B' }
];

const getCriticalityClass = (criticality: Criticality) => {
    switch (criticality) {
        case Criticality.IMEDIATA: return 'bg-purple-500 text-white';
        case Criticality.CRITICA: return 'bg-red-500 text-white';
        case Criticality.MEDIA: return 'bg-sky-500 text-white';
        case Criticality.MINIMA: return 'bg-green-500 text-white';
        default: return 'bg-gray-400 text-white';
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Em dia': return 'bg-green-100 text-green-800';
        case 'Atenção': return 'bg-yellow-100 text-yellow-800';
        case 'Atrasado': return 'bg-red-100 text-red-800';
        case 'Cancelado': return 'bg-gray-200 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const PlurianualSummaryCard: React.FC<{ year: number, demand: number, value: string, onClick: () => void, isSelected: boolean }> = ({ year, demand, value, onClick, isSelected }) => (
    <div 
        onClick={onClick}
        className={`bg-white rounded-md shadow p-4 flex flex-col items-center justify-center text-center border border-gray-200 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
    >
        <p className="text-lg font-semibold text-gray-600">{year}</p>
        <p className="text-3xl font-bold text-gray-800 my-1">{demand}</p>
        <p className="text-sm text-gray-500">Demanda</p>
        <div className="bg-gray-100 text-center rounded p-2 mt-3 w-full">
            <p className="text-gray-700 font-semibold text-sm">{value}</p>
        </div>
    </div>
);


const PlurianualScreen: React.FC = () => {
    const [allData, setAllData] = useState<PlanningData[]>(planningData);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<AdvancedFiltersState | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProjectWorkModalOpen, setIsProjectWorkModalOpen] = useState(false);
    const [selectedItemsForEdit, setSelectedItemsForEdit] = useState<PlanningData[] | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedItemForDetails, setSelectedItemForDetails] = useState<PlanningData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof PlanningData | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [detailsModalInitialTab, setDetailsModalInitialTab] = useState<'details' | 'financial'>('details');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, 3000);
    };
    
    const summaryData = [
        { year: 2026, demand: 28, value: 'R$ 15.000,00' },
        { year: 2027, demand: 35, value: 'R$ 21.000,00' },
        { year: 2028, demand: 42, value: 'R$ 17.000,00' },
        { year: 2029, demand: 28, value: 'R$ 7.000,00' },
        { year: 2030, demand: 15, value: 'R$ 5.000,00' },
        { year: 2031, demand: 10, value: 'R$ 3.000,00' },
    ];
    
    const filteredData = useMemo(() => {
        let data = allData.filter(item =>
            item.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (activeFilters) {
            // Reclassified
            if (activeFilters.reclassified && activeFilters.reclassified !== 'all') {
                 const isReclassified = activeFilters.reclassified === 'yes';
                 data = data.filter(item => !!item.reclassified === isReclassified);
            }
            
            // Unidades
            if (activeFilters.unidades && activeFilters.unidades.length > 0) {
                data = data.filter(item => activeFilters.unidades?.includes(item.unidade));
            }
            
            // Situacoes
            if (activeFilters.situacoes && activeFilters.situacoes.length > 0) {
                 // Check both project and work situation, or generic status
                 data = data.filter(item => 
                     activeFilters.situacoes?.includes(item.situacaoProjeto) ||
                     activeFilters.situacoes?.includes(item.situacaoObra) ||
                     activeFilters.situacoes?.includes(item.status)
                 );
            }
            
            // Entidades
            if (activeFilters.entidades && activeFilters.entidades.length > 0) {
                data = data.filter(item => item.entidade && activeFilters.entidades!.includes(item.entidade));
            }
            
            // Categorias
            if (activeFilters.categorias && activeFilters.categorias.length > 0) {
                 data = data.filter(item => item.categoria && activeFilters.categorias!.includes(item.categoria));
            }

            // Tipologias
            if (activeFilters.tipologias && activeFilters.tipologias.length > 0) {
                 data = data.filter(item => item.tipologia && activeFilters.tipologias!.includes(item.tipologia));
            }
            
            // Origens (Year from inicioProjeto)
            if (activeFilters.origens && activeFilters.origens.length > 0) {
                data = data.filter(item => {
                    if (!item.inicioProjeto || item.inicioProjeto === 'N/A') return false;
                    const parts = item.inicioProjeto.split('/');
                    const year = parts.length === 3 ? parts[2] : '';
                    return activeFilters.origens!.includes(year);
                });
            }
        }

        return data;
    }, [allData, searchTerm, activeFilters]);

    const handleApplyFilters = (filters: AdvancedFiltersState) => {
        setActiveFilters(filters);
    };

    const handleSort = (key: keyof PlanningData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const parseValueForSort = (value: string | number | boolean | undefined | Partial<PlanningData>) => {
        if (value === undefined || value === null || typeof value === 'object') return 0;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            if (value.startsWith('R$')) {
                return parseFloat(value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
            }
            const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (dateRegex.test(value)) {
                const [, day, month, year] = value.match(dateRegex)!;
                return new Date(`${year}-${month}-${day}`).getTime();
            }
        }
        return value;
    }

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];
    
                if (aValue === 'N/A' || aValue == null) return 1;
                if (bValue === 'N/A' || bValue == null) return -1;
    
                const parsedA = parseValueForSort(aValue);
                const parsedB = parseValueForSort(bValue);
    
                if (parsedA < parsedB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (parsedA > parsedB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const totalPages = useMemo(() => Math.ceil(sortedData.length / itemsPerPage), [sortedData, itemsPerPage]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    useEffect(() => {
        setSelectedIds([]);
    }, [sortedData, currentPage, itemsPerPage]);


    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleEditSelected = () => {
        if (selectedIds.length === 0) return;
        
        const selectedItems = allData.filter(item => selectedIds.includes(item.id));

        const hasReclassified = selectedItems.some(item => item.reclassified === true);
        const hasNotReclassified = selectedItems.some(item => !item.reclassified);

        if (hasReclassified && hasNotReclassified) {
            showToast("Operação não realizada. A seleção contém demandas reclassificadas e não reclassificadas.", "error");
            return;
        }

        setSelectedItemsForEdit(selectedItems);
        setIsProjectWorkModalOpen(true);
    };

    const handleCloseProjectWorkModal = () => {
        setIsProjectWorkModalOpen(false);
        setSelectedItemsForEdit(null);
    };

    const handleSaveProjectWorkData = (updatePayload: Partial<PlanningData>) => {
        const idsToUpdate = selectedItemsForEdit?.map(item => item.id) ?? [];
        if (idsToUpdate.length === 0) {
            handleCloseProjectWorkModal();
            return;
        }

        const finalPayload = { ...updatePayload };
        if (finalPayload.inicioProjeto === '') finalPayload.inicioProjeto = 'N/A';
        if (finalPayload.inicioObra === '') finalPayload.inicioObra = 'N/A';

        setAllData(prev =>
            prev.map(item =>
                idsToUpdate.includes(item.id) ? { ...item, ...finalPayload } : item
            )
        );
        handleCloseProjectWorkModal();
        showToast("Demanda(s) atualizada(s) com sucesso.", "success");
    };
    
    const handleViewDetails = (item: PlanningData) => {
        setSelectedItemForDetails(item);
        setDetailsModalInitialTab('details');
        setIsDetailsModalOpen(true);
    };

    const handleEmpenhoClick = (item: PlanningData) => {
        setSelectedItemForDetails(item);
        setDetailsModalInitialTab('financial');
        setIsDetailsModalOpen(true);
    };
    
    const handleSelectRow = (id: number) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(rowId => rowId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        const paginatedIds = paginatedData.map(item => item.id);
        const allOnPageSelected = paginatedData.length > 0 && paginatedIds.every(id => selectedIds.includes(id));

        if (allOnPageSelected) {
            setSelectedIds(prev => prev.filter(id => !paginatedIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...paginatedIds])]);
        }
    };
    
    const SortableHeader: React.FC<{
        columnKey: keyof PlanningData;
        title: string;
    }> = ({ columnKey, title }) => {
        const isSorted = sortConfig.key === columnKey;
        return (
            <th scope="col" className="px-6 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort(columnKey)}>
                <div className="flex items-center space-x-1">
                    <span>{title}</span>
                    {isSorted ? (
                        sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                        <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </th>
        );
    };

    return (
        <>
            <div 
              className={`fixed top-6 left-6 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
              role="alert"
            >
                <p className="font-semibold">{toast.message}</p>
            </div>
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Tela Plurianual</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {summaryData.map(data => (
                        <PlurianualSummaryCard 
                            key={data.year} 
                            {...data} 
                            onClick={() => handleYearSelect(data.year)}
                            isSelected={selectedYear === data.year && isModalOpen}
                        />
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 flex justify-between items-center space-x-4">
                        <div className="relative flex-grow max-w-sm">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Procurar..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                             <button
                                onClick={handleEditSelected}
                                disabled={selectedIds.length === 0}
                                className="flex items-center space-x-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PencilIcon className="w-5 h-5" />
                                <span>Editar</span>
                            </button>
                             <button
                                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span>Exportar</span>
                            </button>
                            <button
                                onClick={() => setShowAdvancedFilters(prev => !prev)}
                                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                            >
                                <FilterIcon className="w-5 h-5" />
                                <span>Filtros Avançados</span>
                            </button>
                        </div>
                    </div>
                    
                    {showAdvancedFilters && (
                        <AdvancedFilters 
                            showReclassified 
                            onFilter={handleApplyFilters}
                            activeFilters={activeFilters}
                        />
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item.id))}
                                            onChange={handleSelectAll}
                                            aria-label="Selecionar todos na página"
                                        />
                                    </th>
                                    <SortableHeader columnKey="criticidade" title="Criticidade" />
                                    <SortableHeader columnKey="ordem" title="Ordem" />
                                    <SortableHeader columnKey="unidade" title="Unidade" />
                                    <SortableHeader columnKey="descricao" title="Descrição" />
                                    <th scope="col" className="px-6 py-3 font-semibold">Tipologia</th>
                                    <SortableHeader columnKey="status" title="Status" />
                                    <th scope="col" className="px-6 py-3 font-semibold">Reclassificado?</th>
                                    <SortableHeader columnKey="saldoObraValor" title="Saldo Valor" />
                                    <SortableHeader columnKey="terminoProjeto" title="Término Projeto" />
                                    <SortableHeader columnKey="terminoObra" title="Término Obra" />
                                    <SortableHeader columnKey="empenho2026" title="Empenho 2026" />
                                    <SortableHeader columnKey="empenho2027" title="Empenho 2027" />
                                    <SortableHeader columnKey="empenho2028" title="Empenho 2028" />
                                    <SortableHeader columnKey="empenho2029" title="Empenho 2029" />
                                    <SortableHeader columnKey="empenho2030" title="Empenho 2030" />
                                    <th scope="col" className="px-6 py-3 font-semibold text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                               {paginatedData.length > 0 ? paginatedData.map(item => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                                        <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                                aria-label={`Selecionar item ${item.ordem}`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCriticalityClass(item.criticidade)}`}>
                                                {item.criticidade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.ordem}</td>
                                        <td className="px-6 py-4">{item.unidade}</td>
                                        <td className="px-6 py-4">{item.descricao}</td>
                                        <td className="px-6 py-4">{item.tipologia}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.reclassified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.reclassified ? 'Sim' : 'Não'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.saldoObraValor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.terminoProjeto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.terminoObra}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.empenho2026}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.empenho2027}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.empenho2028}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.empenho2029}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.empenho2030}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleViewDetails(item)} className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors" aria-label="Visualizar">
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleEmpenhoClick(item)} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors" aria-label="Empenho">
                                                    <BanknotesIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                               )) : (
                                   <tr>
                                        <td colSpan={17} className="text-center py-10 text-gray-500">
                                            Nenhum dado disponível.
                                        </td>
                                   </tr>
                               )}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex items-center justify-between p-4 border-t">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="w-6 h-6 text-gray-400" />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white font-bold rounded-full text-sm">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                            </button>
                             <span className="text-sm text-gray-600">Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                        </div>
                        <div>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="15">15</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <MonthlySummaryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                year={selectedYear}
            />
             <ProjectWorkDataModal
                isOpen={isProjectWorkModalOpen}
                onClose={handleCloseProjectWorkModal}
                data={selectedItemsForEdit}
                onSave={handleSaveProjectWorkData}
            />
            <PlurianualDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={selectedItemForDetails}
                initialTab={detailsModalInitialTab}
            />
        </>
    );
};

export default PlurianualScreen;
