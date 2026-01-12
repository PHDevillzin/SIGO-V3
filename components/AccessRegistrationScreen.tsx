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
    onSuccess: (user: User, isNew: boolean) => void;
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
                    isActive: u.is_active
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

    // 2. Filter Units
    const availableUnits = useMemo(() => {
        if (isGestorLocal && currentUser) {
            const userUnits = currentUser.linkedUnits || [];
            return units.filter(u => userUnits.includes(u.unidadeResumida) || userUnits.includes(u.unidade));
        }
        return units;
    }, [units, isGestorLocal, currentUser]);

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
    const unitOptions = useMemo(() => Array.from(new Set(availableUnits.map(u => u.unidade))).sort(), [availableUnits]);

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
    const showAdditionalFields = selectedProfiles.some(p => !EXEMPT_PROFILES.includes(p));


    const handleSave = async () => {
        if (!selectedUser) return;

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

        const isEditing = !!initialUser || !!selectedUser.registrationDate;

        // Map names back to IDs
        const profileIds = selectedProfiles.map(name => {
            const profile = profiles.find(p => p.name === name);
            return profile ? profile.id : name;
        });

        // Payload
        const updatedUserPayload = {
            ...selectedUser,
            sigo_profiles: profileIds,
            linked_units: selectedUnits,
            registrationDate: selectedUser.registrationDate || new Date().toISOString()
        };

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch('/api/users', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nif: updatedUserPayload.nif,
                    name: updatedUserPayload.name,
                    email: updatedUserPayload.email,
                    sigo_profiles: profileIds,
                    linked_units: selectedUnits,
                    id: selectedUser.id
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save user');
            }

            const savedUser = await response.json();

            // Construct local user state
            const newUserState: User = {
                ...selectedUser,
                sigoProfiles: profileIds,
                linkedUnits: selectedUnits,
                registrationDate: savedUser.registration_date || updatedUserPayload.registrationDate
            };

            showToast(isEditing ? 'Acesso atualizado com sucesso!' : 'Usuário cadastrado com sucesso!', 'success');

            // Delay navigation slightly to show toast
            setTimeout(() => {
                onSuccess(newUserState, !isEditing);
            }, 1000);

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
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">NIF</th>
                                        <th className="px-4 py-3">Nome</th>
                                        <th className="px-4 py-3">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs italic">
                                                Carregando usuários...
                                            </td>
                                        </tr>
                                    ) : paginatedUsers.length > 0 ? paginatedUsers.map(u => (
                                        <tr
                                            key={u.id}
                                            onClick={() => setSelectedUser(u)}
                                            className={`cursor-pointer hover:bg-sky-50 transition-colors ${selectedUser?.nif === u.nif ? 'bg-sky-50 border-l-4 border-l-sky-500' : ''}`}
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">{u.nif}</td>
                                            <td className="px-4 py-3 text-gray-600">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-600 opacity-80">{u.email}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs italic">
                                                Nenhum usuário disponível.
                                            </td>
                                        </tr>
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
                        {selectedUser ? (
                            <>
                                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-sky-700 uppercase">Nome</label>
                                        <p className="text-sm font-bold text-sky-900">{selectedUser.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] font-bold text-sky-700 uppercase">NIF</label>
                                        <p className="text-sm font-bold text-sky-900">{selectedUser.nif}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-sky-700 uppercase">Email</label>
                                        <p className="text-sm text-sky-900">{selectedUser.email}</p>
                                    </div>
                                </div>

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
                            disabled={!selectedUser}
                            className={`px-6 py-2 rounded-md font-bold text-sm uppercase text-white shadow-lg transition-all flex items-center gap-2 ${selectedUser ? 'bg-[#0EA5E9] hover:bg-sky-600' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                            <span>{initialUser ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessRegistrationScreen;
