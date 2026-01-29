
import React, { useState, useMemo, useEffect } from 'react';
import type { Request, PlanningData, Unit, User } from '../types';
import { Criticality } from '../types';
import { EyeIcon, MagnifyingGlassIcon, InformationCircleIcon, FilterIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon, CheckCircleIcon, XMarkIcon, CheckIcon, ArrowDownTrayIcon, TrashIcon } from './Icons';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';
import ReclassificationModal from './ReclassificationModal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';
import PlanningDetailsModal from './PlanningDetailsModal';
import RequestDetailsModal from './RequestDetailsModal';

import EditRequestModal from './EditRequestModal';
import MaintenanceEditModal from './MaintenanceEditModal';
import AssignAreaModal from './AssignAreaModal';
import AssignUnitModal from './AssignUnitModal';
import ManifestationModal from './ManifestationModal';
import type { Manifestation } from '../types';

export const initialRequests: Request[] = [
    { id: 1, criticality: Criticality.IMEDIATA, unit: 'CAT Cubatão (Par...', description: 'reforma do balneá...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-28-0001-P', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '05/01/2030', saldoObraPrazo: 12, saldoObraValor: 'R$ 3.500.000,00' },
    { id: 2, criticality: Criticality.IMEDIATA, unit: 'CAT Cubatão (Par...', description: 'Troca do alambra...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0002-O', situacaoProjeto: 'Concluído', situacaoObra: 'A Realizar', inicioObra: '01/05/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 300.000,00' },
    { id: 3, criticality: Criticality.CRITICA, unit: '9.14 Presidente P...', description: 'Construção de ba...', status: 'Recusada', currentLocation: 'Gestão Local', gestorLocal: 'SHERMAN WILLIAN MUKOYAMA', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0003-O', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/06/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 4, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Reforma do servidor', status: 'Análise da Solicit...', currentLocation: 'Diretoria Corporat...', gestorLocal: '-', expectedStartDate: '05/01/2026', hasInfo: false, expectedValue: '50 mi', executingUnit: 'GSO', prazo: 36, categoriaInvestimento: 'Nova Unidade', entidade: 'SENAI', ordem: 'SS-26-0004-P', situacaoProjeto: 'A Iniciar', situacaoObra: 'Não Iniciada', inicioObra: '01/01/2029', saldoObraPrazo: 24, saldoObraValor: 'R$ 50.000.000,00' },
    { id: 5, criticality: Criticality.CRITICA, unit: '1.35 Santana de ...', description: 'Ampliação bloco A', status: 'Análise da Solicit...', currentLocation: 'Gestão Área Fim', gestorLocal: 'RAPHAEL SUAVE BORGES', expectedStartDate: '03/11/2026', hasInfo: true, expectedValue: '350 mil', executingUnit: 'Unidade', prazo: 8, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0005-O', situacaoProjeto: 'Em Revisão', situacaoObra: 'Aguardando', inicioObra: '10/10/2027', saldoObraPrazo: 8, saldoObraValor: 'R$ 350.000,00' },
    { id: 6, criticality: Criticality.CRITICA, unit: 'Nova Escola SESI...', description: 'teste', status: 'Análise da Solicit...', currentLocation: 'Gestão Área Fim', gestorLocal: '-', expectedStartDate: '05/11/2026', hasInfo: true, expectedValue: '425 mil', executingUnit: 'Unidade', prazo: 10, categoriaInvestimento: 'Reforma Operacional', entidade: 'SESI', ordem: 'SS-26-0006-O', situacaoProjeto: 'Concluído', situacaoObra: 'Em Licitação', inicioObra: '01/02/2027', saldoObraPrazo: 10, saldoObraValor: 'R$ 425.000,00' },
    { id: 7, criticality: Criticality.CRITICA, unit: 'CE 087 - Santos (...', description: 'Reforma de cozinha', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '04/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0007-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '15/01/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 200.000,00' },
    { id: 8, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'ciencia senai ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'José Silva', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'Unidade', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0008-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/01/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 9, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: '11350310 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Maria Oliveira', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '220 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0009-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/03/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 220.000,00' },
    { id: 10, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101251- tes...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Carlos Souza', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0010-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '10/02/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 11, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'ciÊncia 03100...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Ana Santos', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '500 mil', executingUnit: 'GSO', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0011-O', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '01/06/2026', saldoObraPrazo: 12, saldoObraValor: 'R$ 500.000,00' },
    { id: 12, criticality: Criticality.MINIMA, unit: 'CAT Santos (J...', description: 'teste gso', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Pedro Lima', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0012-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '15/03/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 200.000,00' },
    { id: 13, criticality: Criticality.MINIMA, unit: 'CAT Ribeirão ...', description: 'Instalação de ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Fernanda Costa', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0013-O', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/04/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 14, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: '02101306 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Lucas Pereira', expectedStartDate: '04/11/2027', hasInfo: true, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-27-0014-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/02/2028', saldoObraPrazo: 4, saldoObraValor: 'R$ 200.000,00' },
    { id: 15, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Nova Demanda ...', status: 'Em Aprovação', currentLocation: 'Diretoria', gestorLocal: '-', expectedStartDate: '10/12/2025', hasInfo: false, expectedValue: '150 mil', executingUnit: 'Sede', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0015-P', situacaoProjeto: 'Concluído', situacaoObra: 'A Realizar', inicioObra: '01/01/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 150.000,00' },
    { id: 16, criticality: Criticality.IMEDIATA, unit: 'CAT Tatuapé', description: 'Reforma Urgente', status: 'Planejamento', currentLocation: 'GSO', gestorLocal: 'Roberto Almeida', expectedStartDate: '01/02/2026', hasInfo: false, expectedValue: '1.2 mi', executingUnit: 'GSO', prazo: 18, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-26-0016-P', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '01/08/2027', saldoObraPrazo: 18, saldoObraValor: 'R$ 1.200.000,00' },
    { id: 17, criticality: Criticality.MEDIA, unit: 'Escola SENAI', description: 'Upgrade de Lab...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Juliana Rocha', expectedStartDate: '08/08/2026', hasInfo: false, expectedValue: '750 mil', executingUnit: 'Unidade', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0017-O', situacaoProjeto: 'Em Revisão', situacaoObra: 'Aguardando', inicioObra: '10/10/2027', saldoObraPrazo: 12, saldoObraValor: 'R$ 750.000,00' },
    { id: 18, criticality: Criticality.MINIMA, unit: 'CAT Osasco', description: 'Manutenção Rot...', status: 'Concluído', currentLocation: 'Unidade', gestorLocal: 'Ricardo Gomes', expectedStartDate: '03/03/2024', hasInfo: false, expectedValue: '50 mil', executingUnit: 'Unidade', prazo: 2, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-24-0018-P', situacaoProjeto: 'Concluído', situacaoObra: 'Concluída', inicioObra: '01/05/2024', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00' },
    { id: 19, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Expansão de ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: '-', expectedStartDate: '09/09/2027', hasInfo: false, expectedValue: '2.5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SESI', ordem: 'SS-27-0019-P', situacaoProjeto: 'A Iniciar', situacaoObra: 'Não Iniciada', inicioObra: '01/01/2029', saldoObraPrazo: 24, saldoObraValor: 'R$ 2.500.000,00' },
    { id: 20, criticality: Criticality.MEDIA, unit: 'CAT Campinas', description: 'Reforma de Fachada', status: 'Em Execução', currentLocation: 'Unidade', gestorLocal: 'Camila Martins', expectedStartDate: '07/06/2025', hasInfo: false, expectedValue: '400 mil', executingUnit: 'Unidade', prazo: 9, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0020-O', situacaoProjeto: 'Concluído', situacaoObra: 'Em Execução', inicioObra: '10/03/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 200.000,00' },
    { id: 21, criticality: Criticality.MINIMA, unit: '1.01 Brás - Ro...', description: 'Pintura Interna', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Felipe Barbosa', expectedStartDate: '11/11/2025', hasInfo: false, expectedValue: '90 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0021-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/01/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 90.000,00' },
    { id: 22, criticality: Criticality.MEDIA, unit: 'Oficina Central', description: 'Manutenção Preventiva Tornos', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Gustavo Dias', expectedStartDate: '15/01/2026', hasInfo: false, expectedValue: '80 mil', executingUnit: 'Unidade', prazo: 3, categoriaInvestimento: 'Manutenção', entidade: 'SENAI', ordem: 'SS-26-0022-M', tipologia: 'Tipologia B', situacaoProjeto: 'N/A', situacaoObra: 'N/A', inicioObra: 'N/A', saldoObraPrazo: 0, saldoObraValor: 'N/A' },
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

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback if already formatted or invalid
        return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (e) {
        return dateString;
    }
};

interface RequestsTableProps {
    selectedProfile: string;
    currentView: string;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    userName?: string;
    units?: Unit[];
    currentUser?: User; // Added currentUser
}

type Toast = {
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
};

const RequestsTable: React.FC<RequestsTableProps> = ({ selectedProfile, currentView, requests, setRequests, userName, units = [], currentUser }) => {
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRequestForEdit, setSelectedRequestForEdit] = useState<Request | null>(null);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [selectedRequestForMaintenance, setSelectedRequestForMaintenance] = useState<Request | null>(null);

    // Workflow State
    const [isAssignAreaModalOpen, setIsAssignAreaModalOpen] = useState(false);
    const [requestToAssignArea, setRequestToAssignArea] = useState<Request | null>(null);

    const [isAssignUnitModalOpen, setIsAssignUnitModalOpen] = useState(false);
    const [requestToAssignUnit, setRequestToAssignUnit] = useState<Request | null>(null);

    const [isManifestationModalOpen, setIsManifestationModalOpen] = useState(false);
    const [requestToManifest, setRequestToManifest] = useState<Request | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<Request | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setAlertModalMessage(message);
        setIsAlertModalOpen(true);
    };

    const handleEditRequest = (request: Request) => {
        setSelectedRequestForEdit(request);
        setIsEditModalOpen(true);
    };

    const handleSaveEditedRequest = (updatedRequest: Request) => {
        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
        showToast('Solicitação atualizada com sucesso!', 'success');
        setIsEditModalOpen(false);
    };

    const handleDeleteRequest = (request: Request) => {
        setRequestToDelete(request);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRequest = async () => {
        if (!requestToDelete) return;
        try {
            const response = await fetch(`/api/requests?id=${requestToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
                showToast('Solicitação excluída com sucesso!', 'success');
            } else {
                showToast('Falha ao excluir solicitação.', 'error');
            }
        } catch (e) {
            showToast('Erro ao excluir solicitação.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
        }
    };

    const handleUpdateRequestStatus = async (request: Request, newStatus: string, additionalUpdates: Partial<Request> = {}) => {
        try {
            // Use PUT /api/requests if there are additional updates or just to be safe with full updates
            // But api/update_request_status is dedicated.
            // If we have additionalUpdates, we MUST use PUT /api/requests

            let response;
            if (Object.keys(additionalUpdates).length > 0) {
                response = await fetch('/api/requests', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: request.id,
                        status: newStatus,
                        ...additionalUpdates,
                        userName: userName || selectedProfile,
                        userDepartment: selectedProfile
                    })
                });
            } else {
                response = await fetch('/api/update_request_status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requestId: request.id,
                        status: newStatus,
                        user: userName || selectedProfile,
                        department: selectedProfile
                    }),
                });
            }

            if (response.ok) {
                showToast(`Solicitação ${newStatus.toLowerCase()} com sucesso!`, 'success');
                setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: newStatus, ...additionalUpdates } : r));
            } else {
                console.error('Failed to update status');
                showToast('Erro ao atualizar status da solicitação.', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Erro de conexão ao atualizar status.', 'error');
        }
    };

    const handleApprovalAction = (request: Request, action: 'Aprovado' | 'Reprovado') => {
        const currentStatus = request.status;

        if (action === 'Reprovado') {
            handleUpdateRequestStatus(request, 'Recusada');
            return;
        }

        // Approval Logic Flow
        if (currentStatus === 'Aguardando Validação Gestor Área Fim') {
            // Strategic Flow Step 1: Indica Gestão Local
            setRequestToAssignUnit(request);
            setIsAssignUnitModalOpen(true);
            return;
        }

        if (currentStatus === 'Aguardando Validação Gestão Local') {
            // Strategic Flow
            handleUpdateRequestStatus(request, 'Aguardando Validação Alta ADM');
            return;
        }

        if (currentStatus === 'Aguardando Validação Gestor Local') {
            // Operational Flow
            // Require Area Fim assignment
            setRequestToAssignArea(request);
            setIsAssignAreaModalOpen(true);
            return;
        }

        if (currentStatus === 'Aguardando Validação Área Fim') {
            // SENAI flow: Area Fim approved -> Alta ADM
            handleUpdateRequestStatus(request, 'Aguardando Validação Alta ADM');
            return;
        }

        if (currentStatus === 'Aguardando Validação Alta ADM') {
            // Alta ADM approved -> GSO
            handleUpdateRequestStatus(request, 'Em Análise GSO');
            return;
        }

        // Fallback for other statuses or legacy
        handleUpdateRequestStatus(request, action);
    };

    const handleSaveAssignArea = (areas: string[]) => {
        if (!requestToAssignArea) return;

        // Determine next status based on Entity
        // SENAI -> Valida Entidade -> Area Fim Valida (Aguardando Validação Área Fim)
        // SESI -> Valida Entidade -> Indica Areas para Manifestação -> Aguardando Validação Alta ADM (BUT pending manifestation)

        let nextStatus = '';
        let additionalUpdates: Partial<Request> = {};

        if (requestToAssignArea.entidade === 'SESI') {
            // Updated Flow:
            // Gestor Local approves -> Indicates Areas (Manifestation Targets)
            // Status goes to "Aguardando Validação Alta ADM" (as per original flow), 
            // BUT it also becomes visible in "Solicitações manifestação/ciência" UNTIL all manifestations are done.
            // We store the targets.

            nextStatus = 'Aguardando Validação Alta ADM';
            additionalUpdates = {
                manifestationTargets: areas,
                manifestations: [] // Initialize empty
            };
        } else {
            // Default SENAI or others - Logic remains single area (primary responsibility)
            // For SENAI, usually we pick one responsible area.
            // If the modal now returns an array, we take the first one?
            // "AssignAreaModal" is now generic for multiple. 
            // If SENAI flow only supports one, we might assume the user selects one, or we take the first.
            // Or we assume for SENAI "Validação Àrea Fim" only needs one.
            nextStatus = 'Aguardando Validação Área Fim';
            additionalUpdates = {
                areaResponsavel: areas[0] // Take the first as the responsible one
            };
        }

        handleUpdateRequestStatus(requestToAssignArea, nextStatus, additionalUpdates);
        setIsAssignAreaModalOpen(false);
        setRequestToAssignArea(null);
    };

    const handleSaveAssignUnit = (unit: Unit) => {
        if (!requestToAssignUnit) return;

        const newGestor = unit.gerenteRegional || unit.responsavelRA || 'Gestor da Unidade';

        handleUpdateRequestStatus(requestToAssignUnit, 'Aguardando Validação Gestão Local', {
            unit: unit.unidadeResumida || unit.unidade, // Update unit
            gestorLocal: newGestor,
            currentLocation: 'Gestão Local' // Visualization
        });

        setIsAssignUnitModalOpen(false);
        setRequestToAssignUnit(null);
    };

    const handleOpenManifestation = (request: Request) => {
        setRequestToManifest(request);
        setIsManifestationModalOpen(true);
    };

    const handleSaveManifestation = (manifestations: Manifestation[]) => {
        if (!requestToManifest) return;

        // Update the request with the new manifestations
        // If all targets have text, we treat it as done?
        // Requirement: "Após todos se manifestarem a demanda some da lista... e continua aparecendo para aprovação da alta administração"

        // We just update the 'manifestations' field. The filter logic in useMemo will handle visibility.

        handleUpdateRequestStatus(requestToManifest, requestToManifest.status, { manifestations });
        setIsManifestationModalOpen(false);
        setRequestToManifest(null);
    };


    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<PlanningData | null>(null);

    // New state for General Request Details Modal
    const [isRequestDetailsModalOpen, setIsRequestDetailsModalOpen] = useState(false);
    const [selectedRequestForView, setSelectedRequestForView] = useState<Request | null>(null);

    const isReclassificationView = currentView === 'solicitacoes_reclassificacao';
    const isManutencaoView = currentView === 'manutencao';
    const isAprovacaoView = currentView === 'aprovacao';
    const isCienciaView = currentView === 'ciencia';

    const filteredRequests = useMemo(() => {
        let sourceRequests = requests;

        // 1. First, Apply Visibility/Security Filter
        // If user is Admin, GSO, or similar "Global" profile, they see everything (subject to other filters).
        // If user is "Gestor Local" or "Unidade Solicitante", they see:
        //    a) Requests linked to their units (unit in linkedUnits)

        // Define Global Profiles (that see all)
        const globalProfiles = [
            'Administrador do sistema',
            'Administração do sistema',
            'Administrador GSO',
            'Planejamento e Orçamento',
            'Suprimentos',
            'Corporativo',
            'Diretoria',
            'Sede'
        ];

        // We check if the *Selected Profile* has global access OR if the current user has super license.
        const isGlobalProfile = globalProfiles.some(gp => selectedProfile.includes(gp)) || selectedProfile === 'Administrador';

        if (!isGlobalProfile && currentUser) {
            const linkedUnits = currentUser.linkedUnits || [];
            const userName = currentUser.name;

            sourceRequests = sourceRequests.filter(req => {
                // Match unit name against linked units. 
                const isLinkedUnit = linkedUnits.includes(req.unit);

                // Restore Creator Visibility (using Name as NIF is not available on Request)
                // This ensures users see requests they created even if not linked to their unit (e.g. Nova Unidade)
                const isCreator = req.solicitante === userName;

                // Context Switching: Allow view if Selected Profile matches Request's Responsible Area or Involved Areas
                // "Caso selecione um perfil de area fim, passara a se comportar como um perfil de area fim"
                const isAreaMatch = req.areaResponsavel === selectedProfile || (req.areasEnvolvidas && req.areasEnvolvidas.includes(selectedProfile));

                // Corporate Visibility (SENAI): "GED" and others see ALL SENAI requests
                const senaiCorporateProfiles = [
                    'Gerência de Educação',
                    'Gerência de Tecnologia',
                    'Gerência de Infraestrutura',
                    'Gerência de Saúde'
                ];
                // Check if selected profile is one of these (matching substring like "Gerência de Educação (GED)")
                const isSenaiCorporate = senaiCorporateProfiles.some(p => selectedProfile.includes(p)) && req.entidade === 'SENAI';

                return isLinkedUnit || isCreator || isAreaMatch || isSenaiCorporate;
            });
        }

        // 2. Filter by View Mode
        if (isReclassificationView) {
            sourceRequests = sourceRequests.filter(request => request.categoriaInvestimento !== 'Manutenção');
        } else if (isManutencaoView) {
            sourceRequests = sourceRequests.filter(request => request.categoriaInvestimento === 'Manutenção');
        } else if (isAprovacaoView) {
            // For approval, sourceRequests is already filtered by Security above.
            sourceRequests = sourceRequests.filter(request => request.categoriaInvestimento !== 'Manutenção');
        } else if (isCienciaView) {
            sourceRequests = sourceRequests.filter(request => {
                if (request.categoriaInvestimento === 'Manutenção') return false;
                if (request.status === 'Concluído' || request.status === 'Recusada' || request.currentLocation === 'Planejamento') return false;

                const isSesi = request.entidade === 'SESI';
                const isSenai = request.entidade === 'SENAI';
                const loc = request.currentLocation;

                // SESI: Approved by 'Gestor Local' -> Not in 'Gestão Local'
                // NEW LOGIC: Show if it has manifestation targets AND not all have manifested
                if (isSesi) {
                    // Gestor Local Visibility Override: Always show if linked to unit (filtered above) and not concluded/refused (filtered above)
                    if (selectedProfile === 'Gestor Local') {
                        return true;
                    }

                    // Check manifestation status
                    if (request.manifestationTargets && request.manifestationTargets.length > 0) {
                        const manifestCount = request.manifestations?.filter(m => m.text && m.text.trim().length > 0).length || 0;
                        const targetCount = request.manifestationTargets.length;

                        // "ou até a alta administração aprovar"
                        if (request.status === 'Em Análise GSO' || request.status === 'Concluído' || request.status === 'Recusada') {
                            return false;
                        }

                        // Show if NOT complete
                        if (manifestCount < targetCount) {
                            return true;
                        } else {
                            // If complete, hide from Ciencia view
                            return false;
                        }
                    }

                    // Fallback legacy safety:
                    return loc !== 'Gestão Local';
                }

                // SENAI: Approved by 'Gestor Local' AND 'GIS' -> Not in 'Gestão Local' AND Not in 'GSO'
                // SENAI: Approved by 'Gestor Local' AND 'GIS' -> Not in 'Gestão Local' AND Not in 'GSO'
                if (isSenai) {
                    // Gestor Local Visibility Override
                    if (selectedProfile === 'Gestor Local') {
                        return true;
                    }

                    // Check manifestation status - Apply Logic from SESI
                    if (request.manifestationTargets && request.manifestationTargets.length > 0) {
                        const manifestCount = request.manifestations?.filter(m => m.text && m.text.trim().length > 0).length || 0;
                        const targetCount = request.manifestationTargets.length;

                        // "ou até a alta administração aprovar"
                        if (request.status === 'Em Análise GSO' || request.status === 'Concluído' || request.status === 'Recusada') {
                            return false;
                        }

                        // Show if NOT complete
                        if (manifestCount < targetCount) {
                            return true;
                        } else {
                            // If complete, hide from Ciencia view
                            return false;
                        }
                    }

                    return loc !== 'Gestão Local';
                }

                return false;
            });
        }

        // Filter by Search Term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            sourceRequests = sourceRequests.filter(request =>
                (request.unit?.toLowerCase() || '').includes(lowerSearch) ||
                (request.description?.toLowerCase() || '').includes(lowerSearch) ||
                (request.status?.toLowerCase() || '').includes(lowerSearch)
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



    const handleSaveReclassification = async (data: any) => {
        try {
            const updates = selectedIds.map(id => {
                const req = requests.find(r => r.id === id);
                if (!req) return Promise.resolve();

                return fetch('/api/requests', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id,
                        categoriaInvestimento: data.categoria || req.categoriaInvestimento,
                        tipologia: data.tipologia || req.tipologia
                    })
                }).then(res => {
                    if (!res.ok) throw new Error(`Falha ao atualizar ${id}`);
                    return res.json();
                });
            });

            const results = await Promise.all(updates);

            // Update local state with results
            setRequests(prevRequests =>
                prevRequests.map(req => {
                    const updated = results.find((r: any) => r && r.id === req.id);
                    return updated ? { ...req, ...updated } : req; // Merge update
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
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar reclassificação.', 'error');
        }

        setIsReclassificationModalOpen(false);
        setSelectedIds([]);
        setSelectedRequestForReclassification(null);
    };

    const handleSingleSend = async (id: number) => {
        try {
            // Assuming "Enviar" moves to "Classificado" or next step.
            // Using 'Planejamento' or keeping status but ensuring it's processed.
            // If the view filters by status, we might need to change status to hide it.
            // For now, let's update status to "Classificado".
            const response = await fetch('/api/update_request_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: id,
                    status: 'Classificado',
                    user: userName || selectedProfile
                })
            });

            if (response.ok) {
                showToast('Solicitação enviada com sucesso.', 'success');
                setRequests(prevRequests =>
                    prevRequests.map(req => req.id === id ? { ...req, status: 'Classificado' } : req)
                    // If we want to remove from view, filter: .filter(req => req.id !== id)
                );
                setReclassifiedIds(prev =>
                    prev.filter(reclassifiedId => reclassifiedId !== id)
                );
                setSelectedIds(prev =>
                    prev.filter(selectedId => selectedId !== id)
                );
            } else {
                showToast('Erro ao enviar solicitação.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
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

    const handleConfirmBatchSend = async () => {
        try {
            const updates = selectedIds.map(id => {
                return fetch('/api/update_request_status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requestId: id,
                        status: 'Classificado',
                        user: userName || selectedProfile
                    })
                }).then(res => {
                    if (!res.ok) throw new Error(`Falha ao enviar ${id}`);
                    return res.json();
                });
            });

            await Promise.all(updates);

            const message = selectedIds.length > 1 ? 'Solicitações enviadas com sucesso.' : 'Solicitação enviada com sucesso.';
            showToast(message, 'success');

            // Update local state
            setRequests(prevRequests =>
                prevRequests.map(req => selectedIds.includes(req.id) ? { ...req, status: 'Classificado' } : req)
            );

            setReclassifiedIds(prev =>
                prev.filter(id => !selectedIds.includes(id))
            );
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            showToast('Erro ao enviar solicitações em lote.', 'error');
        }
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
        if (isManutencaoView) {
            if (selectedIds.length === 1) {
                const request = requests.find(r => r.id === selectedIds[0]);
                if (request) {
                    setSelectedRequestForMaintenance(request);
                    setIsMaintenanceModalOpen(true);
                }
            } else {
                showToast("Selecione apenas 1 item para editar.", "error");
            }
            return;
        }

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
                    className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
                                className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${isManutencaoView ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
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
                                {isReclassificationView && <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Unidade</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Descrição</th>
                                {(isReclassificationView || isManutencaoView) && <th scope="col" className="px-6 py-3 font-semibold">Tipologia</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>

                                {isReclassificationView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold text-center">Situação Projeto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-center">Início Projeto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Saldo P</th>
                                    </>
                                )}

                                {!isReclassificationView && !isAprovacaoView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Gestor Local</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Início Esperado</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Valor Esperado</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Unidade Exec...</th>
                                        <th scope="col" className="px-6 py-3 font-semibold whitespace-nowrap">Categoria Investimento</th>
                                        <th scope="col" className="px-6 py-3 font-semibold whitespace-nowrap">Tipo Serviço</th>
                                        <th scope="col" className="px-6 py-3 font-semibold whitespace-nowrap">Área Fim</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Entidade</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Ordem</th>
                                    </>
                                )}

                                {isAprovacaoView && (
                                    <>
                                        <th scope="col" className="px-6 py-3 font-semibold">Local Atual</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Gestor Local</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Início Esperado</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Valor Esperado</th>
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
                                    {isReclassificationView && <td className="px-6 py-4">{request.currentLocation}</td>}
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{request.unit}</td>
                                    <td className="px-6 py-4">{request.description}</td>
                                    {(isReclassificationView || isManutencaoView) && <td className="px-6 py-4 whitespace-nowrap">{request.tipologia}</td>}
                                    <td className="px-6 py-4">{request.status}</td>

                                    {isReclassificationView && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">{request.situacaoProjeto}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">{request.expectedStartDate}</td>
                                            <td className="px-6 py-4 text-center">{request.prazo}</td>
                                        </>
                                    )}

                                    {!isReclassificationView && !isAprovacaoView && (
                                        <>
                                            <td className="px-6 py-4">{request.currentLocation}</td>
                                            <td className="px-6 py-4">{request.gestorLocal || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                    <span>{formatDate(request.expectedStartDate)}</span>
                                                    {request.hasInfo && <InformationCircleIcon className="w-5 h-5 text-gray-400" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{request.expectedValue}</td>
                                            <td className="px-6 py-4">{request.executingUnit}</td>
                                            <td className="px-6 py-4">{request.categoriaInvestimento}</td>
                                            <td className="px-6 py-4">{request.atividade}</td>
                                            <td className="px-6 py-4">{request.areaResponsavel}</td>
                                            <td className="px-6 py-4">{request.entidade}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.ordem}</td>
                                        </>
                                    )}

                                    {isAprovacaoView && (
                                        <>
                                            <td className="px-6 py-4">{request.currentLocation}</td>
                                            <td className="px-6 py-4 uppercase">{request.gestorLocal || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.expectedStartDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.expectedValue}</td>
                                        </>
                                    )}

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            {isAprovacaoView && (
                                                <>
                                                    <button
                                                        className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors"
                                                        aria-label="Aprovar"
                                                        onClick={() => handleApprovalAction(request, 'Aprovado')}
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="bg-[#0EA5E9] text-white p-2 rounded-md hover:bg-sky-600 transition-colors"
                                                        aria-label="Reprovar"
                                                        onClick={() => handleApprovalAction(request, 'Reprovado')}
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
                                                className={`${isAprovacaoView ? 'bg-[#0EA5E9]' : 'bg-sky-500'} text-white p-2 rounded-md hover:bg-sky-600 transition-colors ${isCienciaView ? 'hidden' : ''}`}
                                                aria-label="Visualizar"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {(isAprovacaoView || (!isReclassificationView && !isManutencaoView && !isCienciaView)) && (
                                                <button
                                                    onClick={() => handleDownload(request.id)}
                                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
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



                                            {(isManutencaoView) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditRequest(request)}
                                                        className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors"
                                                        aria-label="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            {(isCienciaView && (request.entidade === 'SESI' || request.entidade === 'SENAI')) && (
                                                <button
                                                    onClick={() => handleOpenManifestation(request)}
                                                    className="bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition-colors"
                                                    title="Manifestação"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
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

            <MaintenanceEditModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                request={selectedRequestForMaintenance}
                onSave={handleSaveEditedRequest}
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
            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDeleteRequest}
                    title="Excluir Solicitação"
                    message="Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita."
                    confirmLabel="Excluir"
                    cancelLabel="Cancelar"
                />
            )}
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
            <AssignAreaModal
                isOpen={isAssignAreaModalOpen}
                onClose={() => setIsAssignAreaModalOpen(false)}
                onSave={handleSaveAssignArea}
            />
            <AssignUnitModal
                isOpen={isAssignUnitModalOpen}
                onClose={() => setIsAssignUnitModalOpen(false)}
                onSave={handleSaveAssignUnit}
                units={units}
            />
            <ManifestationModal
                isOpen={isManifestationModalOpen}
                onClose={() => setIsManifestationModalOpen(false)}
                onSave={handleSaveManifestation}
                request={requestToManifest}
                currentUser={userName || selectedProfile}
                userProfile={selectedProfile}
            />
        </>
    );
};

export default RequestsTable;
