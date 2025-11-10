import React, { useState, useMemo, useEffect } from 'react';
import type { Request } from '../types';
import { Criticality } from '../types';
import { EyeIcon, MagnifyingGlassIcon, InformationCircleIcon, FilterIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import EditRequestModal from './EditRequestModal';
import AdvancedFilters from './AdvancedFilters';
import ReclassificationModal from './ReclassificationModal';

const initialRequests: Request[] = [
    { id: 1, criticality: Criticality.IMEDIATA, unit: 'CAT Santo An...', description: 'Reforma Gera...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO' },
    { id: 2, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO' },
    { id: 3, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO' },
    { id: 4, criticality: Criticality.CRITICA, unit: 'Nova Unidade', description: 'Construção de...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2026', hasInfo: false, expectedValue: '50 mi', executingUnit: 'GSO' },
    { id: 5, criticality: Criticality.MEDIA, unit: 'CAT Sertãozin...', description: 'Execução com...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2026', hasInfo: true, expectedValue: '350 mil', executingUnit: 'Unidade' },
    { id: 6, criticality: Criticality.MEDIA, unit: 'CE 342 - Jardi...', description: 'Instalação de I...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2026', hasInfo: true, expectedValue: '425 mil', executingUnit: 'Unidade' },
    { id: 7, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'teste ciência s...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '04/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO' },
    { id: 8, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'ciencia senai ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'Unidade' },
    { id: 9, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: '11350310 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '220 mil', executingUnit: 'GSO' },
    { id: 10, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101251- tes...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO' },
    { id: 11, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'ciÊncia 03100...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '500 mil', executingUnit: 'GSO' },
    { id: 12, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'teste gso', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO' },
    { id: 13, criticality: Criticality.MINIMA, unit: 'CAT Ribeirão ...', description: 'Instalação de ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO' },
    { id: 14, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101306 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '04/11/2027', hasInfo: true, expectedValue: '200 mil', executingUnit: 'GSO' },
    { id: 15, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Nova Demanda ...', status: 'Em Aprovação', currentLocation: 'Diretoria', expectedStartDate: '10/12/2025', hasInfo: false, expectedValue: '150 mil', executingUnit: 'Sede' },
    { id: 16, criticality: Criticality.IMEDIATA, unit: 'CAT Tatuapé', description: 'Reforma Urgente', status: 'Planejamento', currentLocation: 'GSO', expectedStartDate: '01/02/2026', hasInfo: false, expectedValue: '1.2 mi', executingUnit: 'GSO' },
    { id: 17, criticality: Criticality.MEDIA, unit: 'Escola SENAI', description: 'Upgrade de Lab...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '08/08/2026', hasInfo: false, expectedValue: '750 mil', executingUnit: 'Unidade' },
    { id: 18, criticality: Criticality.MINIMA, unit: 'CAT Osasco', description: 'Manutenção Rot...', status: 'Concluído', currentLocation: 'Unidade', expectedStartDate: '03/03/2024', hasInfo: false, expectedValue: '50 mil', executingUnit: 'Unidade' },
    { id: 19, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Expansão de ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '09/09/2027', hasInfo: false, expectedValue: '2.5 mi', executingUnit: 'GSO' },
    { id: 20, criticality: Criticality.MEDIA, unit: 'CAT Campinas', description: 'Reforma de Fachada', status: 'Em Execução', currentLocation: 'Unidade', expectedStartDate: '07/06/2025', hasInfo: false, expectedValue: '400 mil', executingUnit: 'Unidade' },
    { id: 21, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'Pintura Interna', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '11/11/2025', hasInfo: false, expectedValue: '90 mil', executingUnit: 'GSO' },
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

interface RequestsTableProps {
  selectedProfile: string;
  currentView: string;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ selectedProfile, currentView }) => {
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReclassificationModalOpen, setIsReclassificationModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const isReclassificationView = currentView === 'solicitacoes_reclassificacao';

    const filteredRequests = useMemo(() =>
        requests.filter(request =>
            request.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.status.toLowerCase().includes(searchTerm.toLowerCase())
        ), [requests, searchTerm]);

    const totalPages = useMemo(() => Math.ceil(filteredRequests.length / itemsPerPage), [filteredRequests, itemsPerPage]);

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRequests, currentPage, itemsPerPage]);

    useEffect(() => {
        setSelectedIds([]);
    }, [paginatedRequests]);

    const handleEditClick = (request: Request) => {
        setSelectedRequest(request);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedRequest(null);
    };

    const handleSaveRequest = (updatedRequest: Request) => {
        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
        handleCloseModal();
    };

    const handleSaveReclassification = (data: any) => {
        console.log('Reclassifying items:', selectedIds, 'with data:', data);
        // Here you would typically update the state with the new data
        setIsReclassificationModalOpen(false);
        setSelectedIds([]);
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
        const paginatedIds = paginatedRequests.map(item => item.id);
        const allOnPageSelected = paginatedRequests.length > 0 && paginatedIds.every(id => selectedIds.includes(id));

        if (allOnPageSelected) {
            setSelectedIds(prev => prev.filter(id => !paginatedIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...paginatedIds])]);
        }
    };
    
    const modalTitle = isReclassificationView ? "Solicitação para reclassificação" : "Solicitação para classificação";

    return (
        <>
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
                        {isReclassificationView && (
                             <button
                                onClick={() => setIsReclassificationModalOpen(true)}
                                disabled={selectedIds.length === 0}
                                className="flex items-center space-x-2 bg-purple-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PencilIcon className="w-5 h-5" />
                                <span>Reclassificar</span>
                            </button>
                        )}
                        <button 
                            onClick={() => setShowAdvancedFilters(prev => !prev)}
                            className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                        >
                            <FilterIcon className="w-5 h-5" />
                            <span>Filtros Avançados</span>
                        </button>
                    </div>
                </div>

                {showAdvancedFilters && <AdvancedFilters />}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                {isReclassificationView && (
                                    <th scope="col" className="p-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            checked={paginatedRequests.length > 0 && paginatedRequests.every(item => selectedIds.includes(item.id))}
                                            onChange={handleSelectAll}
                                            aria-label="Selecionar todos na página"
                                        />
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-3 font-semibold">Criticidade</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Unidade</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Descrição</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Início Esperado</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Valor Esperado</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Unidade Exec...</th>
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.map(request => (
                                <tr key={request.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                                    {isReclassificationView && (
                                         <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectedIds.includes(request.id)}
                                                onChange={() => handleSelectRow(request.id)}
                                                aria-label={`Selecionar item ${request.id}`}
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCriticalityClass(request.criticality)}`}>
                                            {request.criticality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{request.unit}</td>
                                    <td className="px-6 py-4">{request.description}</td>
                                    <td className="px-6 py-4">{request.status}</td>
                                    <td className="px-6 py-4">{request.currentLocation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                        <span>{request.expectedStartDate}</span>
                                        {request.hasInfo && <InformationCircleIcon className="w-5 h-5 text-gray-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{request.expectedValue}</td>
                                    <td className="px-6 py-4">{request.executingUnit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors">
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {!isReclassificationView && (
                                                <button 
                                                    onClick={() => handleEditClick(request)}
                                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
                                                    aria-label="Editar"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                            disabled={currentPage === totalPages}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                        </button>
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
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>
            <EditRequestModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                request={selectedRequest}
                onSave={handleSaveRequest}
                title={modalTitle}
            />
            <ReclassificationModal
                isOpen={isReclassificationModalOpen}
                onClose={() => setIsReclassificationModalOpen(false)}
                onSave={handleSaveReclassification}
                selectedCount={selectedIds.length}
            />
        </>
    );
};

export default RequestsTable;