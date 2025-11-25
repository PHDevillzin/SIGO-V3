
import React, { useState, useMemo, useEffect } from 'react';
import MonthlySummaryModal from './MonthlySummaryModal';
import AdvancedFilters from './AdvancedFilters';
import { MagnifyingGlassIcon, FilterIcon, PencilIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ArrowsUpDownIcon, ChevronUpIcon, ChevronDownIcon, InformationCircleIcon } from './Icons';
import ProjectWorkDataModal from './ProjectWorkDataModal';
import PlanningDetailsModal from './PlanningDetailsModal';
import { Criticality, PlanningData } from '../types';

const planningData: PlanningData[] = [
    { id: 1, criticidade: Criticality.MEDIA, ordem: 'SS-24-0102-O1', unidade: 'CE 114 - Agudos', descricao: 'Ampliação de 03 salas de aula', situacaoObra: 'Concluída', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: true, inicioProjeto: '15/01/2024', saldoProjetoPrazo: 2, saldoProjetoValor: 'R$ 1.907.299,65', inicioObra: '15/03/2024', saldoObraPrazo: 3, saldoObraValor: 'R$ 1.812.699,83', terminoProjeto: '15/03/2024', terminoObra: '15/06/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 2, criticidade: Criticality.MEDIA, ordem: 'SS-24-0102-O2', unidade: 'CE 114 - Agudos', descricao: 'Instalação de policarbonato', situacaoObra: 'Concluída', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: false, inicioProjeto: '20/02/2024', saldoProjetoPrazo: 1, saldoProjetoValor: 'R$ 72.050,05', inicioObra: '20/03/2024', saldoObraPrazo: 4, saldoObraValor: 'R$ 81.831,62', terminoProjeto: '20/03/2024', terminoObra: '20/07/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 3, criticidade: Criticality.MINIMA, ordem: 'SS-25-0127-P', unidade: 'CE 114 - Agudos', descricao: 'Climatização de ambientes', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '10/01/2025', saldoProjetoPrazo: 4, saldoProjetoValor: 'R$ 17.465,00', inicioObra: '10/05/2025', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00', terminoProjeto: '10/05/2025', terminoObra: 'N/A', empenho2026: 'R$ 8.732,50', empenho2027: 'R$ 8.732,50', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 4, criticidade: Criticality.MINIMA, ordem: 'SS-25-0127-O', unidade: 'CE 114 - Agudos', descricao: 'Climatização (obra)', situacaoObra: 'A Realizar', situacaoProjeto: 'Concluído', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/02/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 375.000,00', terminoProjeto: 'N/A', terminoObra: '01/06/2026', empenho2026: 'R$ 375.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 5, criticidade: Criticality.CRITICA, ordem: 'SS-25-2018-P', unidade: 'CE 114 - Agudos', descricao: 'Campo de futebol society', situacaoObra: 'Cancelada', situacaoProjeto: 'Cancelado', status: 'Cancelado', reclassified: false, inicioProjeto: '05/03/2025', saldoProjetoPrazo: 3, saldoProjetoValor: 'R$ 20.000,00', inicioObra: '05/06/2025', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00', terminoProjeto: '05/06/2025', terminoObra: 'N/A', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 6, criticidade: Criticality.CRITICA, ordem: 'SS-25-2018-O', unidade: 'CE 114 - Agudos', descricao: 'Campo de futebol (obra)', situacaoObra: 'Cancelada', situacaoProjeto: 'Cancelado', status: 'Cancelado', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/03/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 1.500.000,00', terminoProjeto: 'N/A', terminoObra: '01/09/2026', empenho2026: 'R$ 1.500.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 7, criticidade: Criticality.IMEDIATA, ordem: 'SS-24-10289-R', unidade: 'CE 114 - Agudos', descricao: 'Recuperação Ambiental TCRA', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Atenção', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '15/07/2024', saldoObraPrazo: 1, saldoObraValor: 'R$ 91.697,00', terminoProjeto: 'N/A', terminoObra: '15/08/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 8, criticidade: Criticality.MINIMA, ordem: 'SS-24-6030-O', unidade: 'CE 114 - Agudos', descricao: 'Instalações hidráulicas e elétricas', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Atrasado', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/08/2024', saldoObraPrazo: 2, saldoObraValor: 'R$ 140.318,76', terminoProjeto: 'N/A', terminoObra: '01/10/2024', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 9, criticidade: Criticality.MEDIA, ordem: 'SS-26-4010-P', unidade: 'CAT Tatuapé', descricao: 'Reforma da fachada', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: false, inicioProjeto: '10/02/2026', saldoProjetoPrazo: 3, saldoProjetoValor: 'R$ 50.000,00', inicioObra: '10/05/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 450.000,00', terminoProjeto: '10/05/2026', terminoObra: '10/10/2026', empenho2026: 'R$ 500.000,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 10, criticidade: Criticality.CRITICA, ordem: 'SS-27-1120-O', unidade: 'Sede', descricao: 'Construção Anexo II', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: true, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '15/06/2027', saldoObraPrazo: 12, saldoObraValor: 'R$ 12.000.000,00', terminoProjeto: 'N/A', terminoObra: '15/06/2028', empenho2026: 'R$ 0,00', empenho2027: 'R$ 6.000.000,00', empenho2028: 'R$ 6.000.000,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 11, criticidade: Criticality.IMEDIATA, ordem: 'SS-28-0015-R', unidade: 'CE 055 - Osasco', descricao: 'Reparo emergencial telhado', situacaoObra: 'Em Execução', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '01/01/2028', saldoObraPrazo: 2, saldoObraValor: 'R$ 250.000,00', terminoProjeto: 'N/A', terminoObra: '01/03/2028', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 250.000,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 12, criticidade: Criticality.MINIMA, ordem: 'SS-29-3030-P', unidade: 'CAT Campinas', descricao: 'Pintura externa prédio B', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '20/03/2029', saldoProjetoPrazo: 1, saldoProjetoValor: 'R$ 5.000,00', inicioObra: '20/04/2029', saldoObraPrazo: 3, saldoObraValor: 'R$ 120.000,00', terminoProjeto: '20/04/2029', terminoObra: '20/07/2029', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 125.000,00', empenho2030: 'R$ 0,00' },
    { id: 13, criticidade: Criticality.MEDIA, ordem: 'SS-30-5555-O', unidade: 'CE 201 - Itaquera', descricao: 'Reforma elétrica geral', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Em dia', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '05/08/2030', saldoObraPrazo: 8, saldoObraValor: 'R$ 850.000,00', terminoProjeto: 'N/A', terminoObra: '05/04/2031', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 850.000,00' },
    { id: 14, criticidade: Criticality.CRITICA, ordem: 'SS-26-9100-P', unidade: 'CAT Sertãozinho', descricao: 'Ampliação de laboratórios', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '11/11/2026', saldoProjetoPrazo: 4, saldoProjetoValor: 'R$ 150.000,00', inicioObra: '11/03/2027', saldoObraPrazo: 9, saldoObraValor: 'R$ 2.300.000,00', terminoProjeto: '11/03/2027', terminoObra: '11/12/2027', empenho2026: 'R$ 150.000,00', empenho2027: 'R$ 2.300.000,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 15, criticidade: Criticality.MINIMA, ordem: 'SS-27-8020-O', unidade: '1.01 Brás', descricao: 'Manutenção de calçadas', situacaoObra: 'A Realizar', situacaoProjeto: 'Não Aplicável', status: 'Atenção', reclassified: false, inicioProjeto: 'N/A', saldoProjetoPrazo: 0, saldoProjetoValor: 'R$ 0,00', inicioObra: '20/09/2027', saldoObraPrazo: 2, saldoObraValor: 'R$ 80.000,00', terminoProjeto: 'N/A', terminoObra: '20/11/2027', empenho2026: 'R$ 0,00', empenho2027: 'R$ 80.000,00', empenho2028: 'R$ 0,00', empenho2029: 'R$ 0,00', empenho2030: 'R$ 0,00' },
    { id: 16, criticidade: Criticality.MEDIA, ordem: 'SS-28-7777-P', unidade: 'CE 342 - Jundiaí', descricao: 'Projeto de acessibilidade', situacaoObra: 'Não Iniciada', situacaoProjeto: 'A Realizar', status: 'Em dia', reclassified: true, inicioProjeto: '14/07/2028', saldoProjetoPrazo: 5, saldoProjetoValor: 'R$ 95.000,00', inicioObra: '14/12/2028', saldoObraPrazo: 6, saldoObraValor: 'R$ 900.000,00', terminoProjeto: '14/12/2028', terminoObra: '14/06/2029', empenho2026: 'R$ 0,00', empenho2027: 'R$ 0,00', empenho2028: 'R$ 95.000,00', empenho2029: 'R$ 900.000,00', empenho2030: 'R$ 0,00' }
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

const PlanningSummaryCard: React.FC<{ year: number, demand: number, value: string, onClick: () => void, isSelected: boolean }> = ({ year, demand, value, onClick, isSelected }) => (
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

interface CellWithTooltipProps {
    value: string | number;
    originalValue?: string | number;
    className?: string;
}

const CellWithTooltip: React.FC<CellWithTooltipProps> = ({ value, originalValue, className }) => {
    const hasChange = originalValue !== undefined && originalValue !== value;

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            <span className="truncate">{value}</span>
            {hasChange && (
                 <div className="group relative">
                    <InformationCircleIcon className="w-4 h-4 text-orange-500 cursor-help" />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                        Anterior: {originalValue}
                    </div>
                </div>
            )}
        </div>
    );
};


const PlanningScreen: React.FC = () => {
    const [allData, setAllData] = useState<PlanningData[]>(planningData);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProjectWorkModalOpen, setIsProjectWorkModalOpen] = useState(false);
    const [selectedItemsForEdit, setSelectedItemsForEdit] = useState<PlanningData[] | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedItemForDetails, setSelectedItemForDetails] = useState<PlanningData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof PlanningData | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isToastVisible, setIsToastVisible] = useState(false);

    const summaryData = [
        { year: 2026, demand: 28, value: 'R$ 15.000,00' },
        { year: 2027, demand: 35, value: 'R$ 21.000,00' },
        { year: 2028, demand: 42, value: 'R$ 17.000,00' },
        { year: 2029, demand: 28, value: 'R$ 7.000,00' },
        { year: 2030, demand: 15, value: 'R$ 5.000,00' },
        { year: 2031, demand: 10, value: 'R$ 3.000,00' },
    ];
    
    const filteredData = useMemo(() =>
        allData.filter(item =>
            item.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.situacaoObra.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.situacaoProjeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase())
        ), [allData, searchTerm]
    );

    const handleSort = (key: keyof PlanningData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // FIX: Updated parseValueForSort to handle boolean types for sorting, which was causing a type error.
    const parseValueForSort = (value: string | number | boolean | undefined) => {
        if (value === undefined) return 0;
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
    
                // FIX: Changed strict equality check to loose equality to handle both null and undefined values for optional properties.
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
            prev.map(item => {
                if (!idsToUpdate.includes(item.id)) return item;

                const newChanges = { ...(item.changes || {}) };
                let hasChanges = false;

                (Object.keys(finalPayload) as Array<keyof PlanningData>).forEach(key => {
                    const newValue = finalPayload[key];
                    const oldValue = item[key];

                    // Logic: If the value is changing, track the original value
                    // If we edit multiple times, we prefer to keep the 'original' value from before the *first* edit in the session,
                    // or strictly the previous value. The requirement says "dado anterior a alteração" (previous data).
                    // Let's assume we preserve the value before any modifications were made if it's not already tracked.
                    
                    if (newValue !== oldValue) {
                         if (newChanges[key] === undefined) {
                             // Store the original value only if it wasn't already stored
                             // This handles the "original" vs "modified" concept best
                             newChanges[key] = oldValue as any; 
                         }
                         // If we revert to original, we could remove the key, but keeping it shows it was "touched"
                         // Simpler approach: Just check difference.
                         hasChanges = true;
                    }
                });

                return { 
                    ...item, 
                    ...finalPayload,
                    changes: Object.keys(newChanges).length > 0 ? newChanges : undefined
                };
            })
        );
        handleCloseProjectWorkModal();
        setIsToastVisible(true);
        setTimeout(() => {
            setIsToastVisible(false);
        }, 3000);
    };
    
    const handleViewDetails = (item: PlanningData) => {
        setSelectedItemForDetails(item);
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
              className={`fixed top-6 left-6 bg-green-600 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out ${isToastVisible ? 'translate-x-0' : '-translate-x-[150%]'}`}
              role="alert"
            >
                <p className="font-semibold">Demanda(s) atualizada(s) com sucesso.</p>
            </div>
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Tela Planejamento</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {summaryData.map(data => (
                        <PlanningSummaryCard 
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
                    
                    {showAdvancedFilters && <AdvancedFilters hideSituacao />}

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
                                    <SortableHeader columnKey="situacaoProjeto" title="Situação Projeto" />
                                    <SortableHeader columnKey="inicioProjeto" title="Início Projeto" />
                                    <SortableHeader columnKey="saldoProjetoPrazo" title="Saldo Projeto Prazo" />
                                    <SortableHeader columnKey="saldoProjetoValor" title="Saldo Projeto Valor" />
                                    <SortableHeader columnKey="situacaoObra" title="Situação obra" />
                                    <SortableHeader columnKey="inicioObra" title="Início Obra" />
                                    <SortableHeader columnKey="saldoObraPrazo" title="Saldo Obra Prazo" />
                                    <SortableHeader columnKey="saldoObraValor" title="Saldo Obra Valor" />
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
                                        <td className="px-6 py-4"></td>
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
                                        <td className="px-6 py-4">
                                            <CellWithTooltip value={item.situacaoProjeto} originalValue={item.changes?.situacaoProjeto} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <CellWithTooltip value={item.inicioProjeto} originalValue={item.changes?.inicioProjeto} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <CellWithTooltip value={item.saldoProjetoPrazo} originalValue={item.changes?.saldoProjetoPrazo} className="justify-center" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <CellWithTooltip value={item.saldoProjetoValor} originalValue={item.changes?.saldoProjetoValor} />
                                        </td>
                                        <td className="px-6 py-4">
                                             <CellWithTooltip value={item.situacaoObra} originalValue={item.changes?.situacaoObra} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <CellWithTooltip value={item.inicioObra} originalValue={item.changes?.inicioObra} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <CellWithTooltip value={item.saldoObraPrazo} originalValue={item.changes?.saldoObraPrazo} className="justify-center"/>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <CellWithTooltip value={item.saldoObraValor} originalValue={item.changes?.saldoObraValor} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button 
                                                    onClick={() => handleViewDetails(item)} 
                                                    className={`${item.changes && Object.keys(item.changes).length > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-sky-500 hover:bg-sky-600'} text-white p-2 rounded-md transition-colors`} 
                                                    aria-label="Visualizar"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                   <tr>
                                        <td colSpan={17} className="text-center py-10 text-gray-500">
                                            Nenhum dado encontrado.
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
            <PlanningDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={selectedItemForDetails}
            />
        </>
    );
};

export default PlanningScreen;