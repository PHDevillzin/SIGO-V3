import React, { useState, useMemo, useEffect } from 'react';
import type { Request } from '../types';
import { Criticality } from '../types';
import { EyeIcon, MagnifyingGlassIcon, InformationCircleIcon, FilterIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon, CheckCircleIcon } from './Icons';
import AdvancedFilters from './AdvancedFilters';
import ReclassificationModal from './ReclassificationModal';

const initialRequests: Request[] = [
    { id: 1, criticality: Criticality.IMEDIATA, unit: 'CAT Santo An...', description: 'Reforma Gera...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-28-0001-P' },
    { id: 2, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0002-O' },
    { id: 3, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0003-O' },
    { id: 4, criticality: Criticality.CRITICA, unit: 'Nova Unidade', description: 'Construção de...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2026', hasInfo: false, expectedValue: '50 mi', executingUnit: 'GSO', prazo: 36, categoriaInvestimento: 'Nova Unidade', entidade: 'SENAI', ordem: 'SS-26-0004-P' },
    { id: 5, criticality: Criticality.MEDIA, unit: 'CAT Sertãozin...', description: 'Execução com...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2026', hasInfo: true, expectedValue: '350 mil', executingUnit: 'Unidade', prazo: 8, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0005-O' },
    { id: 6, criticality: Criticality.MEDIA, unit: 'CE 342 - Jardi...', description: 'Instalação de I...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2026', hasInfo: true, expectedValue: '425 mil', executingUnit: 'Unidade', prazo: 10, categoriaInvestimento: 'Reforma Operacional', entidade: 'SESI', ordem: 'SS-26-0006-O' },
    { id: 7, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'teste ciência s...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '04/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0007-P' },
    { id: 8, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'ciencia senai ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'Unidade', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0008-P' },
    { id: 9, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: '11350310 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '220 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0009-P' },
    { id: 10, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101251- tes...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0010-P' },
    { id: 11, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'ciÊncia 03100...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '500 mil', executingUnit: 'GSO', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0011-O' },
    { id: 12, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'teste gso', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0012-P' },
    { id: 13, criticality: Criticality.MINIMA, unit: 'CAT Ribeirão ...', description: 'Instalação de ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0013-O' },
    { id: 14, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101306 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '04/11/2027', hasInfo: true, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-27-0014-P' },
    { id: 15, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Nova Demanda ...', status: 'Em Aprovação', currentLocation: 'Diretoria', expectedStartDate: '10/12/2025', hasInfo: false, expectedValue: '150 mil', executingUnit: 'Sede', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0015-P' },
    { id: 16, criticality: Criticality.IMEDIATA, unit: 'CAT Tatuapé', description: 'Reforma Urgente', status: 'Planejamento', currentLocation: 'GSO', expectedStartDate: '01/02/2026', hasInfo: false, expectedValue: '1.2 mi', executingUnit: 'GSO', prazo: 18, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-26-0016-P' },
    { id: 17, criticality: Criticality.MEDIA, unit: 'Escola SENAI', description: 'Upgrade de Lab...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '08/08/2026', hasInfo: false, expectedValue: '750 mil', executingUnit: 'Unidade', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0017-O' },
    { id: 18, criticality: Criticality.MINIMA, unit: 'CAT Osasco', description: 'Manutenção Rot...', status: 'Concluído', currentLocation: 'Unidade', expectedStartDate: '03/03/2024', hasInfo: false, expectedValue: '50 mil', executingUnit: 'Unidade', prazo: 2, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-24-0018-P' },
    { id: 19, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Expansão de ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '09/09/2027', hasInfo: false, expectedValue: '2.5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SESI', ordem: 'SS-27-0019-P' },
    { id: 20, criticality: Criticality.MEDIA, unit: 'CAT Campinas', description: 'Reforma de Fachada', status: 'Em Execução', currentLocation: 'Unidade', expectedStartDate: '07/06/2025', hasInfo: false, expectedValue: '400 mil', executingUnit: 'Unidade', prazo: 9, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0020-O' },
    { id: 21, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'Pintura Interna', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '11/11/2025', hasInfo: false, expectedValue: '90 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0021-P' },
    { id: 22, criticality: Criticality.MEDIA, unit: 'Oficina Central', description: 'Manutenção Preventiva Tornos', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '15/01/2026', hasInfo: false, expectedValue: '80 mil', executingUnit: 'Unidade', prazo: 3, categoriaInvestimento: 'Manutenção', entidade: 'SENAI', ordem: 'SS-26-0022-M', tipologia: 'Tipologia B' },
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

type Toast = {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
};

const RequestsTable: React.FC<RequestsTableProps> = ({ selectedProfile, currentView }) => {
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReclassificationModalOpen, setIsReclassificationModalOpen] = useState(false);
    const [selectedRequestForReclassification, setSelectedRequestForReclassification] = useState<Request | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reclassifiedIds, setReclassifiedIds] = useState<number[]>([]);
    const [toast, setToast] = useState<Toast | null>(null);

    const isReclassificationView = currentView === 'solicitacoes_reclassificacao';
    const isManutencaoView = currentView === 'manutencao';

    const filteredRequests = useMemo(() => {
        const sourceRequests = isReclassificationView
            ? requests.filter(request => request.categoriaInvestimento !== 'Manutenção')
            : requests;
        
        return sourceRequests.filter(request =>
            request.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [requests, searchTerm, isReclassificationView]);

    const totalPages = useMemo(() => Math.ceil(filteredRequests.length / itemsPerPage), [filteredRequests, itemsPerPage]);

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRequests, currentPage, itemsPerPage]);

    useEffect(() => {
        setSelectedIds([]);
    }, [paginatedRequests]);
    
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => prev ? { ...prev, isVisible: false } : null);
            setTimeout(() => setToast(null), 500); // Allow fade out animation
        }, 3000);
    };

    const handleSaveReclassification = (data: any) => {
        console.log(`Saving reclassification for items: ${selectedIds.join(', ')}`, 'Data:', data);

        setRequests(prevRequests =>
            prevRequests.map(req => {
                if (selectedIds.includes(req.id)) {
                    return {
                        ...req,
                        categoriaInvestimento: data.categoria || req.categoriaInvestimento,
                        tipologia: data.tipologia || req.tipologia,
                    };
                }
                return req;
            })
        );
        // Mark these IDs as reclassified to show the 'Enviar' button
        setReclassifiedIds(prev => [...new Set([...prev, ...selectedIds])]);
        
        showToast(selectedIds.length > 1 ? 'Solicitações salvas com sucesso.' : 'Solicitação salva com sucesso.', 'success');

        setIsReclassificationModalOpen(false);
        setSelectedIds([]);
        setSelectedRequestForReclassification(null);
    };
    
    const handleSingleSend = (id: number) => {
        showToast('Solicitação enviada com sucesso.', 'success');
        setRequests(prevRequests => 
            prevRequests.filter(req => req.id !== id)
        );
        setReclassifiedIds(prev => 
            prev.filter(reclassifiedId => reclassifiedId !== id)
        );
        setSelectedIds(prev =>
            prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleBatchSend = () => {
        if (selectedIds.length === 0) {
            showToast("Selecione um ou mais itens reclassificados para enviar.", "error");
            return;
        }

        const nonSendableSelected = selectedIds.filter(id => !reclassifiedIds.includes(id));

        if (nonSendableSelected.length > 0) {
            showToast("Verifique os itens para envio. Somente registros habilitados podem ser enviados juntos.", "error");
            return;
        }

        const message = selectedIds.length > 1 ? 'Solicitações enviadas com sucesso.' : 'Solicitação enviada com sucesso.';
        showToast(message, 'success');

        setRequests(prevRequests => 
            prevRequests.filter(req => !selectedIds.includes(req.id))
        );
        setReclassifiedIds(prev => 
            prev.filter(id => !selectedIds.includes(id))
        );
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
    
    const handleOpenReclassificationModal = () => {
        if (selectedIds.length === 1) {
            const requestToReclassify = requests.find(r => r.id === selectedIds[0]);
            setSelectedRequestForReclassification(requestToReclassify || null);
        } else {
            setSelectedRequestForReclassification(null); // For bulk edit, modal starts empty
        }
        setIsReclassificationModalOpen(true);
    };
        
    const isAnyItemReadyToSend = reclassifiedIds.length > 0;
    const showEditButton = isReclassificationView || isManutencaoView;
    const editButtonLabel = isManutencaoView ? 'Editar' : 'Reclassificar';


    return (
        <>
            {toast && (
                <div
                    className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    role="alert"
                    aria-live="assertive"
                >
                    {toast.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}
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
                                onClick={handleBatchSend}
                                disabled={!isAnyItemReadyToSend}
                                className="flex items-center space-x-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                <span>Enviar</span>
                            </button>
                        )}
                        {showEditButton && (
                            <button
                                onClick={handleOpenReclassificationModal}
                                disabled={selectedIds.length === 0}
                                className="flex items-center space-x-2 bg-purple-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PencilIcon className="w-5 h-5" />
                                <span>{editButtonLabel}</span>
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
                                {(isReclassificationView || isManutencaoView) && (
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
                                {isReclassificationView && <th scope="col" className="px-6 py-3 font-semibold">Tipologia</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                                {!isReclassificationView && <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Início Esperado</th>
                                {isReclassificationView && <th scope="col" className="px-6 py-3 font-semibold text-center">Prazo (meses)</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Valor Esperado</th>
                                {isReclassificationView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Categoria Investimento</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Entidade</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Ordem</th>
                                    </>
                                )}
                                {!isReclassificationView && <th scope="col" className="px-6 py-3 font-semibold">Unidade Exec...</th>}
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.map(request => (
                                <tr key={request.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                                    {(isReclassificationView || isManutencaoView) && (
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
                                    {isReclassificationView && <td className="px-6 py-4 whitespace-nowrap">{request.tipologia}</td>}
                                    <td className="px-6 py-4">{request.status}</td>
                                    {!isReclassificationView && <td className="px-6 py-4">{request.currentLocation}</td>}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                        <span>{request.expectedStartDate}</span>
                                        {request.hasInfo && <InformationCircleIcon className="w-5 h-5 text-gray-400" />}
                                        </div>
                                    </td>
                                    {isReclassificationView && <td className="px-6 py-4 text-center">{request.prazo}</td>}
                                    <td className="px-6 py-4">{request.expectedValue}</td>
                                    {isReclassificationView && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.categoriaInvestimento}</td>
                                            <td className="px-6 py-4">{request.entidade}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.ordem}</td>
                                        </>
                                    )}
                                    {!isReclassificationView && <td className="px-6 py-4">{request.executingUnit}</td>}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors" aria-label="Visualizar">
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {isReclassificationView && reclassifiedIds.includes(request.id) && (
                                                <button
                                                    onClick={() => handleSingleSend(request.id)}
                                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
                                                    aria-label="Enviar"
                                                >
                                                    <PaperAirplaneIcon className="w-5 h-5" />
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
            <ReclassificationModal
                isOpen={isReclassificationModalOpen}
                onClose={() => setIsReclassificationModalOpen(false)}
                onSave={handleSaveReclassification}
                selectedCount={selectedIds.length}
                request={selectedRequestForReclassification}
                title={isManutencaoView ? 'Reclassificação de solicitação (Manutenção)' : undefined}
                isMaintenanceMode={isManutencaoView}
            />
        </>
    );
};

export default RequestsTable;