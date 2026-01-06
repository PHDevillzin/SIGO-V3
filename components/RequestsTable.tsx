
import React, { useState, useMemo, useEffect } from 'react';
import type { Request, PlanningData } from '../types';
import { Criticality } from '../types';
import { EyeIcon, MagnifyingGlassIcon, InformationCircleIcon, FilterIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon, CheckCircleIcon, XMarkIcon, CheckIcon, ArrowDownTrayIcon } from './Icons';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';
import ReclassificationModal from './ReclassificationModal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';
import PlanningDetailsModal from './PlanningDetailsModal';
import RequestDetailsModal from './RequestDetailsModal';

export const initialRequests: Request[] = [];

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
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
}

type Toast = {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
};

const RequestsTable: React.FC<RequestsTableProps> = ({ selectedProfile, currentView, requests, setRequests }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isReclassificationModalOpen, setIsReclassificationModalOpen] = useState(false);
    const [selectedRequestForReclassification, setSelectedRequestForReclassification] = useState<Request | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<AdvancedFiltersState | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reclassifiedIds, setReclassifiedIds] = useState<number[]>([]);
    const [toast, setToast] = useState<Toast | null>(null);
    const [isConfirmSendModalOpen, setIsConfirmSendModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalMessage, setAlertModalMessage] = useState('');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<PlanningData | null>(null);

    // New state for General Request Details Modal
    const [isRequestDetailsModalOpen, setIsRequestDetailsModalOpen] = useState(false);
    const [selectedRequestForView, setSelectedRequestForView] = useState<Request | null>(null);

    const isReclassificationView = currentView === 'solicitacoes_reclassificacao';
    const isManutencaoView = currentView === 'manutencao';
    const isAprovacaoView = currentView === 'aprovacao';

    const filteredRequests = useMemo(() => {
        let sourceRequests = requests;
        
        // Filter by View Mode
        if (isReclassificationView) {
            sourceRequests = requests.filter(request => request.categoriaInvestimento !== 'Manutenção');
        } else if (isManutencaoView) {
            sourceRequests = requests.filter(request => request.categoriaInvestimento === 'Manutenção');
        } else if (isAprovacaoView) {
            // For approval, we might want to filter by status, but for now we'll just show all non-maintenance for the sake of the prototype or filter a subset
            sourceRequests = requests.filter(request => request.categoriaInvestimento !== 'Manutenção');
        }
        
        // Filter by Search Term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            sourceRequests = sourceRequests.filter(request =>
                request.unit.toLowerCase().includes(lowerSearch) ||
                request.description.toLowerCase().includes(lowerSearch) ||
                request.status.toLowerCase().includes(lowerSearch)
            );
        }

        // Apply Advanced Filters Additively
        if (activeFilters) {
            // Entidades
            if (activeFilters.entidades && activeFilters.entidades.length > 0) {
                sourceRequests = sourceRequests.filter(req => req.entidade && activeFilters.entidades!.includes(req.entidade));
            }
            
            // Unidades
            if (activeFilters.unidades && activeFilters.unidades.length > 0) {
                sourceRequests = sourceRequests.filter(req => activeFilters.unidades!.includes(req.unit));
            }

            // Situacoes (Status)
            if (activeFilters.situacoes && activeFilters.situacoes.length > 0) {
                 sourceRequests = sourceRequests.filter(req => {
                    const statusMatch = req.status && activeFilters.situacoes!.includes(req.status);
                    const projMatch = req.situacaoProjeto && activeFilters.situacoes!.includes(req.situacaoProjeto);
                    const obraMatch = req.situacaoObra && activeFilters.situacoes!.includes(req.situacaoObra);
                    return statusMatch || projMatch || obraMatch;
                 });
            }

            // Categorias
            if (activeFilters.categorias && activeFilters.categorias.length > 0) {
                 sourceRequests = sourceRequests.filter(req => req.categoriaInvestimento && activeFilters.categorias!.includes(req.categoriaInvestimento));
            }

            // Tipologias
            if (activeFilters.tipologias && activeFilters.tipologias.length > 0) {
                 sourceRequests = sourceRequests.filter(req => req.tipologia && activeFilters.tipologias!.includes(req.tipologia));
            }
            
            // Origens (Year)
            if (activeFilters.origens && activeFilters.origens.length > 0) {
                sourceRequests = sourceRequests.filter(req => {
                    if (!req.expectedStartDate) return false;
                    const parts = req.expectedStartDate.split('/');
                    const year = parts.length === 3 ? parts[2] : '';
                    return activeFilters.origens!.includes(year);
                });
            }

            // Reclassified Status
            if (activeFilters.reclassified && activeFilters.reclassified !== 'all') {
                const wantReclassified = activeFilters.reclassified === 'yes';
                sourceRequests = sourceRequests.filter(req => {
                    const isReclassified = reclassifiedIds.includes(req.id);
                    return wantReclassified ? isReclassified : !isReclassified;
                });
            }

            // Date Range
            const parseDate = (d: string) => {
                if (!d) return NaN;
                if (d.includes('/')) {
                    const [day, month, year] = d.split('/').map(Number);
                    return new Date(year, month - 1, day).getTime();
                }
                if (d.includes('-')) {
                    const [year, month, day] = d.split('-').map(Number);
                    return new Date(year, month - 1, day).getTime();
                }
                return NaN;
            };

            if (activeFilters.de) {
                const fromTime = parseDate(activeFilters.de);
                if (!isNaN(fromTime)) {
                     sourceRequests = sourceRequests.filter(req => {
                        const t = parseDate(req.expectedStartDate);
                        return !isNaN(t) && t >= fromTime;
                     });
                }
            }
            if (activeFilters.ate) {
                const toTime = parseDate(activeFilters.ate);
                if (!isNaN(toTime)) {
                     sourceRequests = sourceRequests.filter(req => {
                        const t = parseDate(req.expectedStartDate);
                        return !isNaN(t) && t <= toTime;
                     });
                }
            }
        }
        
        return sourceRequests;
    }, [requests, searchTerm, isReclassificationView, isManutencaoView, isAprovacaoView, activeFilters, reclassifiedIds]);

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
        
        if (isManutencaoView) {
            showToast('Reclassificação concluída com sucesso.', 'success');
        } else if (data.categoria === 'Manutenção') {
            const message = selectedIds.length > 1
                ? "Demandas enviadas para manutenção com Sucesso."
                : "Demanda enviada para manutenção com Sucesso.";
            setAlertModalMessage(message);
            setIsAlertModalOpen(true);
        } else {
            // Mark these IDs as reclassified to show the 'Enviar' button
            setReclassifiedIds(prev => [...new Set([...prev, ...selectedIds])]);
            showToast(selectedIds.length > 1 ? 'Solicitações salvas com sucesso.' : 'Solicitação salva com sucesso.', 'success');
        }

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
            showToast("Selecione um ou mais itens habilitados para enviar.", "error");
            return;
        }

        const nonSendableSelected = selectedIds.filter(id => !reclassifiedIds.includes(id));

        if (nonSendableSelected.length > 0) {
            showToast("Verifique os itens para envio. Somente registros habilitados podem ser enviados juntos.", "error");
            return;
        }

        setIsConfirmSendModalOpen(true);
    };
    
    const handleConfirmBatchSend = () => {
        const message = selectedIds.length > 1 ? 'Solicitações enviadas com sucesso.' : 'Solicitação enviada com sucesso.';
        showToast(message, 'success');

        setRequests(prevRequests => 
            prevRequests.filter(req => !selectedIds.includes(req.id))
        );
        setReclassifiedIds(prev => 
            prev.filter(id => !selectedIds.includes(id))
        );
        setSelectedIds([]);
        setIsConfirmSendModalOpen(false);
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

    const handleCancelReclassification = () => {
        showToast('Nenhum registro foi alterado.', 'error');
        setIsReclassificationModalOpen(false);
        setSelectedIds([]);
        setSelectedRequestForReclassification(null);
    }
    
    const mapRequestToPlanningData = (request: Request): PlanningData => {
        return {
            id: request.id,
            criticidade: request.criticality,
            ordem: request.ordem || 'N/A',
            unidade: request.unit,
            descricao: request.description,
            situacaoObra: 'Não Iniciada', // Default as it's a new request
            situacaoProjeto: request.status,
            status: request.status,
            reclassified: true, // It is in reclassification view
            inicioProjeto: request.expectedStartDate,
            saldoProjetoPrazo: request.prazo || 0,
            saldoProjetoValor: request.expectedValue.includes('R$') ? request.expectedValue : `R$ ${request.expectedValue}`, // Formatting attempt
            inicioObra: 'N/A',
            saldoObraPrazo: 0,
            saldoObraValor: 'R$ 0,00',
            terminoProjeto: 'N/A',
            terminoObra: 'N/A',
            empenho2026: 'R$ 0,00',
            empenho2027: 'R$ 0,00',
            empenho2028: 'R$ 0,00',
            empenho2029: 'R$ 0,00',
            empenho2030: 'R$ 0,00'
        };
    };

    const handleViewReclassificationDetails = (request: Request) => {
        const planningData = mapRequestToPlanningData(request);
        setSelectedRequestForDetails(planningData);
        setIsDetailsModalOpen(true);
    };

    const handleOpenRequestDetails = (request: Request) => {
        setSelectedRequestForView(request);
        setIsRequestDetailsModalOpen(true);
    };

    const handleDownload = async (id: number) => {
        const fileName = 'SS250618_Demanda_Estrategica_SENAI041220251424.pdf';
        const blob = new Blob(['Conteúdo do arquivo PDF simulado'], { type: 'application/pdf' });

        const downloadFallback = () => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast('Arquivo salvo com sucesso', 'success');
        };

        try {
            // Check if running in an iframe safely
            let isIframe = false;
            try {
                isIframe = window.self !== window.top;
            } catch (e) {
                isIframe = true;
            }

            // Only attempt File System Access API if NOT in an iframe and if supported
            // This prevents "Cross origin sub frames" error in preview environments
            if ('showSaveFilePicker' in window && !isIframe) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'PDF Document',
                            accept: { 'application/pdf': ['.pdf'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    showToast('Arquivo salvo com sucesso', 'success');
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        return; // User cancelled
                    }
                    console.warn('File System Access API error:', err);
                    downloadFallback();
                }
            } else {
                downloadFallback();
            }
        } catch (err) {
            console.error('Unexpected download error:', err);
            downloadFallback();
        }
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
                        {(isReclassificationView) && (
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
                            className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                        >
                            <FilterIcon className="w-5 h-5" />
                            <span>Filtros Avançados</span>
                        </button>
                    </div>
                </div>

                {showAdvancedFilters && (
                    <AdvancedFilters 
                        onFilter={setActiveFilters} 
                        activeFilters={activeFilters}
                        showReclassified={isReclassificationView || isManutencaoView}
                    />
                )}
                
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
                                {(isReclassificationView || isManutencaoView) && <th scope="col" className="px-6 py-3 font-semibold">Tipologia</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                                
                                {isReclassificationView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Situação Projeto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Início Projeto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-center">Saldo Projeto Prazo</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Saldo Projeto Valor</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Situação Obra</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Início Obra</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-center">Saldo Obra Prazo</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Saldo Obra Valor</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Categoria Investimento</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Entidade</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Ordem</th>
                                    </>
                                )}
                                
                                {!isReclassificationView && !isAprovacaoView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Início Esperado</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Valor Esperado</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Unidade Exec...</th>
                                    </>
                                )}

                                {isAprovacaoView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Gestor Local</th>
                                    </>
                                )}
                                
                                <th scope="col" className="px-6 py-3 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.length > 0 ? paginatedRequests.map(request => (
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
                                    {(isReclassificationView || isManutencaoView) && <td className="px-6 py-4 whitespace-nowrap">{request.tipologia}</td>}
                                    <td className="px-6 py-4">{request.status}</td>
                                    
                                    {isReclassificationView && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.situacaoProjeto}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.expectedStartDate}</td>
                                            <td className="px-6 py-4 text-center">{request.prazo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.expectedValue}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.situacaoObra}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.inicioObra}</td>
                                            <td className="px-6 py-4 text-center">{request.saldoObraPrazo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.saldoObraValor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.categoriaInvestimento}</td>
                                            <td className="px-6 py-4">{request.entidade}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.ordem}</td>
                                        </>
                                    )}

                                    {!isReclassificationView && !isAprovacaoView && (
                                        <>
                                            <td className="px-6 py-4">{request.currentLocation}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                <span>{request.expectedStartDate}</span>
                                                {request.hasInfo && <InformationCircleIcon className="w-5 h-5 text-gray-400" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{request.expectedValue}</td>
                                            <td className="px-6 py-4">{request.executingUnit}</td>
                                        </>
                                    )}

                                    {isAprovacaoView && (
                                        <>
                                            <td className="px-6 py-4">{request.currentLocation}</td>
                                            <td className="px-6 py-4 uppercase">{request.gestorLocal || '-'}</td>
                                        </>
                                    )}
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            {isAprovacaoView && (
                                                <>
                                                    <button 
                                                        className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors" 
                                                        aria-label="Aprovar"
                                                        onClick={() => showToast('Solicitação aprovada com sucesso!', 'success')}
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors" 
                                                        aria-label="Reprovar"
                                                        onClick={() => showToast('Solicitação reprovida.', 'error')}
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    if (isReclassificationView) {
                                                        handleViewReclassificationDetails(request);
                                                    } else if (isAprovacaoView) {
                                                        handleOpenRequestDetails(request);
                                                    } else if (!isManutencaoView) {
                                                        // Default view (Solicitacoes Gerais)
                                                        handleOpenRequestDetails(request);
                                                    }
                                                }}
                                                className={`${isAprovacaoView ? 'bg-[#0EA5E9]' : 'bg-sky-500'} text-white p-2 rounded-md hover:bg-sky-600 transition-colors`} 
                                                aria-label="Visualizar"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {(isAprovacaoView || (!isReclassificationView && !isManutencaoView)) && (
                                                <button
                                                    onClick={() => handleDownload(request.id)}
                                                    className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors"
                                                    aria-label="Baixar Formulário"
                                                >
                                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {(isReclassificationView) && reclassifiedIds.includes(request.id) && (
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
                            )) : (
                                <tr>
                                    <td colSpan={isReclassificationView ? 17 : 9} className="text-center py-10 text-gray-500">
                                        Nenhum registro encontrado para os filtros selecionados.
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
                onCancelSave={handleCancelReclassification}
                selectedCount={selectedIds.length}
                request={selectedRequestForReclassification}
                isMaintenanceMode={isManutencaoView}
            />
            <ConfirmationModal
                isOpen={isConfirmSendModalOpen}
                onClose={() => setIsConfirmSendModalOpen(false)}
                onConfirm={handleConfirmBatchSend}
                title="Confirmar Envio"
                message="Deseja realmente validar e enviar a demanda para o planejamento?"
            />
            <AlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                title="Sucesso"
                message={alertModalMessage}
            />
            <PlanningDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={selectedRequestForDetails}
                title="Detalhes da reclassificação"
            />
            <RequestDetailsModal 
                isOpen={isRequestDetailsModalOpen}
                onClose={() => setIsRequestDetailsModalOpen(false)}
                request={selectedRequestForView}
            />
        </>
    );
};

export default RequestsTable;
