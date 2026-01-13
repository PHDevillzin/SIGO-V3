import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PaperAirplaneIcon, InformationCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, CheckCircleIcon } from './Icons';
import { MultiSelectDropdown } from './AdvancedFilters';
import type { User, Unit, AccessProfile } from '../types';

interface AccessRegistrationScreenProps {
    onBack: () => void;
    units: Unit[];
    profiles: AccessProfile[];
    registeredUsers: User[];
    initialUser: User | null;
    currentUser: User;
    currentProfile: string;
    onSuccess: (users: User | User[], isNew: boolean) => void;
}



const AccessRegistrationScreen: React.FC<AccessRegistrationScreenProps> = ({
    onBack,
    units,
    profiles,
    registeredUsers,
    initialUser,
    currentUser,
    currentProfile,
    onSuccess
}) => {
    // SELECTION STATE
    const [selectedUser, setSelectedUser] = useState<User | null>(initialUser);
    const [filterText, setFilterText] = useState('');
    const [selectedBatchNifs, setSelectedBatchNifs] = useState<Set<string>>(new Set());

    const toggleBatchSelection = (nif: string) => {
        setSelectedBatchNifs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nif)) newSet.delete(nif);
            else newSet.add(nif);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        // Select all FILTERED users
        if (selectedBatchNifs.size === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedBatchNifs(new Set());
        } else {
            setSelectedBatchNifs(new Set(filteredUsers.map(u => u.nif)));
        }
    };

    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

    // CHECKBOXES
    const [isApprover, setIsApprover] = useState(false);
    const [isRequester, setIsRequester] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', visible: boolean } | null>(null);

    // FETCH STATE
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
    };

    // Load All Users
    useEffect(() => {
        if (initialUser) return; 
        
        async function fetchUsers() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/users');
                if (!res.ok) throw new Error('Falha ao carregar usuários');
                const data = await res.json();
                
                // Map API response (snake_case) to Frontend User Type (camelCase)
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: String(u.id),
                    nif: u.nif,
                    name: u.name,
                    email: u.email,
                    createdBy: u.created_by,
                    createdAt: u.created_at,
                    updatedAt: u.updated_at,
                    sigoProfiles: u.sigo_profiles,
                    linkedUnits: u.linked_units,
                    isActive: u.is_active,
                    isApprover: u.is_approver,
                    isRequester: u.is_requester
                }));
                setAllUsers(mappedUsers);
            } catch (err) {
                console.error(err);
                showToast('Erro ao carregar lista de usuários', 'error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, [initialUser]);

    // Permission Logic
    const isGestorLocal = currentProfile === 'Gestor Local';

    // 1. Filter Profiles
    const availableProfiles = useMemo(() => {
        const assignableProfiles = profiles.filter(p => p.name !== 'Administrador do sistema' && p.name !== 'Administração do sistema');
        if (currentProfile === 'Administrador do sistema' || currentProfile === 'Administrador GSO') {
            return assignableProfiles;
        }
        if (isGestorLocal) {
            return assignableProfiles.filter(p => ['Gestor Local', 'Unidade Solicitante'].includes(p.name));
        }
        return assignableProfiles;
    }, [profiles, currentProfile, isGestorLocal]);

    // 2. Filter Units (Base availability for the current admin)
    const availableUnits = useMemo(() => {
        if (isGestorLocal && currentUser) {
            const userUnits = currentUser.linkedUnits || [];
            return units.filter(u => userUnits.includes(u.unidadeResumida) || userUnits.includes(u.unidade));
        }
        return units;
    }, [units, isGestorLocal, currentUser]);

    // 2.5 Filter Units for Target User (NIF Logic)
    const assignableUnits = useMemo(() => {
        let filtered = availableUnits;

        // Rule: If profile is 'Gestor Local' or 'Unidade Solicitante', filter by NIF
        const isRestrictedProfile = selectedProfiles.includes('Gestor Local') || selectedProfiles.includes('Unidade Solicitante');
        
        if (isRestrictedProfile) {
            let targetNifs: string[] = [];
            if (selectedBatchNifs.size > 0) {
                targetNifs = Array.from(selectedBatchNifs);
            } else if (selectedUser?.nif) {
                targetNifs = [selectedUser.nif];
            }

            const prefixes = new Set<string>();
            targetNifs.forEach(nif => {
                const p = nif.substring(0, 2).toUpperCase();
                if (p === 'SS' || p === 'SN') prefixes.add(p);
            });

            if (prefixes.has('SS') && prefixes.has('SN')) {
                // Mixed Entities selected: Cannot assume a common restricted unit.
                // Return empty to prevent invalid assignment.
                return [];
            } else if (prefixes.has('SS')) {
                filtered = filtered.filter(u => u.entidade === 'SESI');
            } else if (prefixes.has('SN')) {
                filtered = filtered.filter(u => u.entidade === 'SENAI');
            }
        }

        return filtered;
    }, [availableUnits, selectedUser, selectedProfiles, selectedBatchNifs]);

    // 3. Filter Source Users (exclude already registered)
    const availableSourceUsers = useMemo(() => {
        const sourceList = allUsers; 
        return sourceList.filter(u => !registeredUsers.some(r => r.nif === u.nif && r.sigoProfiles && r.sigoProfiles.length > 0));
    }, [registeredUsers, allUsers]);


    // Initial Data Pre-fill
    useEffect(() => {
        if (initialUser) {
            setSelectedUser(initialUser);
            // Map IDs to Names for dropdown
            const profileNames = initialUser.sigoProfiles
                ? initialUser.sigoProfiles.map(id => profiles.find(p => p.id === id)?.name || id)
                : [];
            setSelectedProfiles(profileNames);
            setSelectedUnits(initialUser.linkedUnits || []);
            setIsApprover(!!initialUser.isApprover);
            setIsRequester(!!initialUser.isRequester);
        } else {
            setSelectedUser(null);
            setSelectedProfiles([]);
            setSelectedUnits([]);
            setIsApprover(false);
            setIsRequester(false);
        }
        setError(null);
    }, [initialUser, profiles]);

    // Reset when changing selected user in Create Mode
    useEffect(() => {
        if (!initialUser && selectedUser) {
            setSelectedProfiles([]);
            setSelectedUnits([]);
            setIsApprover(false);
            setIsRequester(false);
            setError(null);
        }
    }, [selectedUser, initialUser]);

    // COMPUTED OPTIONS
    const unitOptions = useMemo(() => Array.from(new Set(assignableUnits.map(u => u.unidade))).sort(), [assignableUnits]);

    const profileOptions = useMemo(() => {
        const sorted = [...availableProfiles].sort((a, b) => {
            const getGroup = (p: AccessProfile) => {
                const cat = (p.category || 'CORPORATIVO').toUpperCase();
                const name = p.name.toUpperCase();
                const isManagement = name.includes('GERÊNCIA') || name.includes('GESTOR') || name.includes('DIRETORIA') || name.includes('ADMINISTRAÇÃO');
                if ((cat === 'CORPORATIVO' || cat === 'GERAL') && !isManagement) return 1;
                if ((cat === 'CORPORATIVO' || cat === 'GERAL') && isManagement) return 2;
                if (cat === 'SESI' && isManagement) return 3;
                if (cat === 'SENAI' && isManagement) return 4;
                return 5;
            };
            const groupA = getGroup(a);
            const groupB = getGroup(b);
            if (groupA !== groupB) return groupA - groupB;
            return a.name.localeCompare(b.name);
        });
        return sorted.map(p => p.name);
    }, [availableProfiles]);


    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        return availableSourceUsers.filter(u =>
            u.name.toLowerCase().includes(filterText.toLowerCase()) ||
            u.nif.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [availableSourceUsers, filterText]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [filterText]);

    // VISIBILITY LOGIC
    const EXEMPT_PROFILES = [
        'Administrador GSO', 'Diretoria Corporativa', 'Gestor (GSO)', 'Planejamento (GSO)',
        'Gerência de Comunicação e Marketing Institucional', 'Gerência de Facilities',
        'Gerência de Planejamento e Controladoria', 'Gerência Sênior Contábil e Financeira',
        'Gerência Sênior de Obras', 'Gerência Sênior de Recursos Humanos',
        'Gerência Sênior de Tecnologia da Informação', 'Gerência Sênior Jurídica e Editora',
        'Administração do sistema', 'Administrador do sistema'
    ];
    
    // Force Gestor (GSO) to never be Approver/Requester
    useEffect(() => {
        if (selectedProfiles.includes('Gestor (GSO)')) {
            setIsApprover(false);
            setIsRequester(false);
        }
    }, [selectedProfiles]);

    const showAdditionalFields = selectedProfiles.some(p => 
        ['Gestor Local', 'Unidade Solicitante'].includes(p) || !EXEMPT_PROFILES.includes(p)
    );



    const handleSave = async () => {
        // Targets: either the batch (list) OR the single selectedUser (if batch is empty)
        // If batch has items, we process strictly the batch list.
        // If batch is empty, we process selectedUser.
        let targets: User[] = [];
        
        if (selectedBatchNifs.size > 0) {
            // Find all user objects in allUsers that match the NIFs
            targets = allUsers.filter(u => selectedBatchNifs.has(u.nif));
        } else if (selectedUser) {
            targets = [selectedUser];
        }

        if (targets.length === 0) return;


        if (selectedProfiles.length === 0) {
            setError('Por favor, selecione ao menos um perfil de acesso.');
            return;
        }

        // Validate Units
        const selectedProfileObjects = selectedProfiles.map(name => profiles.find(p => p.name === name)).filter(Boolean);
        const isAdmin = selectedProfileObjects.some(p => p?.name === 'Administração do sistema' || p?.name === 'Administrador do sistema');
        const mustHaveUnit = selectedProfileObjects.some(p => p?.name === 'Gestor Local' || p?.name === 'Unidade Solicitante');
        const hasExemptProfile = selectedProfileObjects.some(p => (p?.category === 'GERAL' || p?.category === 'CORPORATIVO'));

        if (selectedUnits.length === 0) {
            if (!isAdmin) {
                if (mustHaveUnit) {
                    setError('Os perfis Gestor Local e Unidade Solicitante exigem a seleção de pelo menos uma unidade.');
                    return;
                } else if (!hasExemptProfile) {
                    setError('Por favor, selecione ao menos uma unidade (ou Perfil Geral/Corporativo válido).');
                    return;
                }
            }
        }

        const isEditing = !!initialUser || (targets.length === 1 && !!targets[0].registrationDate);

        // Map names back to IDs
        const profileIds = selectedProfiles.map(name => {
            const profile = profiles.find(p => p.name === name);
            return profile ? profile.id : name;
        });

        try {
            let successCount = 0;
            const errors: string[] = [];

            // Process each target sequentially (or parallel)
            for (const targetUser of targets) {
                 const isTargetEditing = !!targetUser.registrationDate; // Assume if date exists, it's an edit
                 const method = isTargetEditing ? 'PUT' : 'POST';
                 
                 const payload = {
                    nif: targetUser.nif,
                    name: targetUser.name,
                    email: targetUser.email,
                    sigo_profiles: profileIds,
                    linked_units: selectedUnits,
                    isApprover,
                    isRequester,
                    id: targetUser.id
                 };

                const response = await fetch('/api/users', {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const err = await response.json();
                    errors.push(`${targetUser.nif}: ${err.error || 'Failed'}`);
                } else {
                    successCount++;
                }
            }

            if (errors.length > 0) {
                 showToast(`Salvo ${successCount} de ${targets.length}. Erros: ${errors.length}`, 'error');
                 console.error('Batch errors:', errors);
            } else {
                 showToast(isEditing && targets.length === 1 ? 'Acesso atualizado com sucesso!' : `${successCount} usuários cadastrados com sucesso!`, 'success');
            }

            if (targets.length === 1) {
                const savedTarget = targets[0];
                 const newUserState: User = {
                    ...savedTarget,
                    sigoProfiles: profileIds,
                    linkedUnits: selectedUnits,
                    isApprover,
                    isRequester,
                    registrationDate: savedTarget.registrationDate || new Date().toISOString()
                };
                 setTimeout(() => {
                    onSuccess(newUserState, !isEditing);
                }, 1000);
            } else {
                 // Batch Success
                 // Construct array of updated users
                 const updatedBatch = targets.map(t => ({
                     ...t,
                     sigoProfiles: profileIds,
                     linkedUnits: selectedUnits,
                     isApprover,
                     isRequester,
                     registrationDate: t.registrationDate || new Date().toISOString()
                 }));

                 setTimeout(() => {
                    onSuccess(updatedBatch, false); 
                 }, 1000);
            }

        } catch (err: any) {
            console.error(err);
            showToast(`Erro ao salvar: ${err.message}`, 'error');
        }
    };

    // Safety check for hooks
    if (!currentUser) return null;

    return (
        <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden relative">
            {toast?.visible && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <CheckCircleIcon className="w-6 h-6" />
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-white p-6 border-b border-gray-200 flex items-center gap-4 shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-[#0B1A4E]">
                        {initialUser ? 'Editar Acesso' : 'Vincular Acesso'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {initialUser ? 'Atualize as permissões e unidades do usuário.' : 'Selecione um usuário para conceder acesso ao sistema.'}
                    </p>
                </div>
            </div>

            <div className={`flex-1 overflow-hidden p-6 flex gap-6 ${isGestorLocal ? 'flex-col lg:flex-row' : ''}`}>
                {/* LEFT: USER SELECTION (Only in Create Mode) */}
                {!initialUser && (
                    <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col min-w-[300px] overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-bold text-[#0B1A4E] uppercase tracking-wide mb-3 flex items-center gap-2">
                                <MagnifyingGlassIcon className="w-4 h-4 text-sky-500" />
                                1. Selecionar Usuário
                            </h3>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por Nome ou NIF..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-sky-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-white uppercase bg-[#0B1A4E] sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 w-10 text-center font-semibold">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    onChange={toggleSelectAll}
                                                    checked={filteredUsers.length > 0 && selectedBatchNifs.size === filteredUsers.length}
                                                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer bg-white"
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-semibold tracking-wider">NIF</th>
                                        <th className="px-4 py-3 font-semibold tracking-wider">Nome</th>
                                        <th className="px-4 py-3 font-semibold tracking-wider">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm italic">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <MagnifyingGlassIcon className="w-6 h-6 animate-pulse" />
                                                    <span>Carregando usuários...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map(user => {
                                            const isSelected = selectedBatchNifs.has(user.nif);
                                            return (
                                                <tr
                                                    key={user.nif}
                                                    onClick={() => !isLoading && toggleBatchSelection(user.nif)} // Changed setSelectedUser(u) to toggleBatchSelection(user.nif)
                                                    className={`hover:bg-sky-50 transition-colors cursor-pointer group ${isSelected ? 'bg-sky-50/60' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleBatchSelection(user.nif)}
                                                                className={`w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer ${isSelected ? 'accent-sky-600' : ''}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-3 font-medium transition-colors ${isSelected ? 'text-sky-700' : 'text-gray-900'}`}>
                                                        {user.nif}
                                                    </td>
                                                    <td className={`px-4 py-3 transition-colors ${isSelected ? 'text-sky-900 font-medium' : 'text-gray-700'}`}>
                                                        {user.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 font-light text-xs">
                                                        {user.email}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-center items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <span className="text-xs font-bold text-gray-600">{currentPage} / {Math.max(1, totalPages)}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}

                {/* RIGHT: CONFIGURATION FORM */}
                <div className={`flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${initialUser ? 'w-full max-w-3xl mx-auto' : 'basis-[450px] shrink-0'}`}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-bold text-[#0B1A4E] uppercase tracking-wide flex items-center gap-2">
                            <InformationCircleIcon className="w-4 h-4 text-sky-500" />
                            {initialUser ? 'Dados do Acesso' : '2. Configurar Acesso'}
                        </h3>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        {selectedUser || selectedBatchNifs.size > 0 ? (
                            <>
                                {selectedBatchNifs.size > 1 ? (
                                    <div className="bg-sky-50 rounded-lg p-4 border border-sky-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold text-sky-700 uppercase">Usuários Selecionados</label>
                                            <span className="bg-sky-200 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">{selectedBatchNifs.size}</span>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                            {allUsers.filter(u => selectedBatchNifs.has(u.nif)).map(u => (
                                                <div key={u.nif} className="text-sm font-bold text-sky-900 border-b border-sky-200/50 last:border-0 pb-1 last:pb-0">
                                                    {u.name} <span className="text-xs font-normal text-sky-600 opacity-80">- {u.nif}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-sky-200">
                                            <p className="text-[10px] text-sky-600 italic leading-tight">
                                                A configuração abaixo será aplicada a <strong>todos</strong> os usuários listados acima.
                                            </p>
                                        </div>
                                    </div>
                                ) : (selectedUser || (selectedBatchNifs.size === 1 && allUsers.find(u => selectedBatchNifs.has(u.nif)))) ? (
                                    <div className="bg-sky-50 rounded-lg p-4 border border-sky-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-sky-700 uppercase">Nome</label>
                                            <p className="text-sm font-bold text-sky-900">{selectedUser?.name || allUsers.find(u => selectedBatchNifs.has(u.nif))?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-[10px] font-bold text-sky-700 uppercase">NIF</label>
                                            <p className="text-sm font-bold text-sky-900">{selectedUser?.nif || allUsers.find(u => selectedBatchNifs.has(u.nif))?.nif}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-sky-700 uppercase">Email</label>
                                            <p className="text-sm text-sky-900">{selectedUser?.email || allUsers.find(u => selectedBatchNifs.has(u.nif))?.email}</p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="space-y-4">
                                    <MultiSelectDropdown
                                        label="Perfis de Acesso"
                                        options={profileOptions}
                                        selectedValues={selectedProfiles}
                                        onChange={(vals) => { setSelectedProfiles(vals); setError(null); }}
                                        placeholder="Selecione os perfis..."
                                    />

                                    {showAdditionalFields && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <MultiSelectDropdown
                                                    label="Unidades Vinculadas"
                                                    options={unitOptions}
                                                    selectedValues={selectedUnits}
                                                    onChange={(vals) => { setSelectedUnits(vals); setError(null); }}
                                                    placeholder="Selecione as unidades..."
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1 italic">* Obrigatório para Gestor Local e Unidade Solicitante.</p>
                                            </div>

                                            <div className="flex gap-6 p-4 bg-gray-50 rounded border border-gray-100">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={isApprover} onChange={e => setIsApprover(e.target.checked)} className="rounded text-sky-600 focus:ring-sky-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Aprovador</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={isRequester} onChange={e => setIsRequester(e.target.checked)} className="rounded text-sky-600 focus:ring-sky-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Solicitante</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
                                        <InformationCircleIcon className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
                                <InformationCircleIcon className="w-12 h-12" />
                                <p className="text-sm font-medium">Selecione um usuário para continuar</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button onClick={onBack} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-bold text-sm uppercase transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedUser && selectedBatchNifs.size === 0}
                            className={`px-6 py-2 rounded-md font-bold text-sm uppercase text-white shadow-lg transition-all flex items-center gap-2 ${(selectedUser || selectedBatchNifs.size > 0) ? 'bg-[#0EA5E9] hover:bg-sky-600' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                            <span>{initialUser ? 'Salvar Alterações' : (selectedBatchNifs.size > 0 ? `Salvar (${selectedBatchNifs.size})` : 'Concluir Cadastro')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessRegistrationScreen;
