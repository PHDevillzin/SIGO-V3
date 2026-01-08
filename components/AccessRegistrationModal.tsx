
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PaperAirplaneIcon, InformationCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { MultiSelectDropdown } from './AdvancedFilters';
import type { User, Unit, AccessProfile } from '../types';

interface AccessRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null; // If null, we are in "Create" mode (Select user first)
    sourceUsers?: User[]; // List of available users to select from
    onConfirm: (data: { profiles: string[], units: string[], selectedUser?: User }) => void;
    units: Unit[];
    profiles: AccessProfile[];
}

const AccessRegistrationModal: React.FC<AccessRegistrationModalProps> = ({
    isOpen,
    onClose,
    user: initialUser,
    sourceUsers = [],
    onConfirm,
    units,
    profiles
}) => {
    // Selection state matches the "Single Step" flow
    const [selectedUser, setSelectedUser] = useState<User | null>(initialUser);
    const [filterText, setFilterText] = useState('');

    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedUser(initialUser);
            setFilterText('');
            if (initialUser) {
                // Edit Mode: Pre-fill
                const profileNames = initialUser.sigoProfiles
                    ? initialUser.sigoProfiles.map(id => profiles.find(p => p.id === id)?.name || id)
                    : [];

                setSelectedProfiles(profileNames);
                setSelectedUnits(initialUser.linkedUnits || []);
            } else {
                // Create Mode: Reset
                setSelectedProfiles([]);
                setSelectedUnits([]);
            }
            setError(null);
        }
    }, [isOpen, initialUser, profiles]);

    // Reset Form when switching selected user in the grid (Create Mode)
    useEffect(() => {
        if (!initialUser && selectedUser) {
            // When user picks someone new in Grid, reset the form Access fields
            // (Or keep them? Usually resetting is safer unless we want bulk add)
            // User Request: "data of this user will complete textbox below... and I will select profile"
            // Implies fresh start for each user selection.
            setSelectedProfiles([]);
            setSelectedUnits([]);
            setError(null);
        }
    }, [selectedUser, initialUser]);


    const unitOptions = useMemo(() => Array.from(new Set(units.map(u => u.unidade))).sort(), [units]);
    const profileOptions = useMemo(() => profiles.map(p => p.name).sort(), [profiles]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredSourceUsers = useMemo(() => {
        return sourceUsers.filter(u =>
            u.name.toLowerCase().includes(filterText.toLowerCase()) ||
            u.nif.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [sourceUsers, filterText]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSourceUsers.slice(start, start + itemsPerPage);
    }, [filteredSourceUsers, currentPage]);

    const totalPages = Math.ceil(filteredSourceUsers.length / itemsPerPage);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterText]);

    if (!isOpen) return null;

    const isEditing = !!initialUser?.registrationDate;

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProfiles.length === 0) {
            setError('Por favor, selecione ao menos um perfil de acesso.');
            return;
        }

        // Admin Validation Logic
        const isAdmin = selectedProfiles.includes('Administração do sistema');
        if (selectedUnits.length === 0 && !isAdmin) {
            setError('Por favor, selecione ao menos uma unidade (ou Perfil Administrador).');
            return;
        }

        const profileIds = selectedProfiles.map(name => {
            const profile = profiles.find(p => p.name === name);
            return profile ? profile.id : name;
        });

        onConfirm({
            profiles: profileIds,
            units: selectedUnits,
            selectedUser: selectedUser || undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className={`bg-white rounded-lg shadow-2xl w-full ${!isEditing ? 'max-w-7xl' : 'max-w-2xl'} animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]`}>
                {/* Header */}
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg shrink-0">
                    <h2 className="text-lg font-bold text-[#0B1A4E]">
                        {isEditing ? 'Editar Acesso do Usuário' : 'Vincular Acesso ao Usuário'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className={`overflow-y-auto flex-1 p-8 ${!isEditing ? 'flex gap-8' : 'space-y-8'}`}>
                    {/* Grid Section: Always visible in Create Mode */}
                    {!isEditing && (
                        <div className={`space-y-6 ${!isEditing ? 'basis-[60%]' : ''}`}>
                            <h3 className="text-sm font-bold text-[#0B1A4E] uppercase tracking-wide flex items-center gap-2">
                                <MagnifyingGlassIcon className="w-5 h-5 text-sky-500" />
                                1. Selecione o Usuário
                            </h3>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por Nome ou NIF..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans text-sm shadow-sm"
                                    autoFocus={!selectedUser}
                                />
                            </div>

                            <div className="border rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-white uppercase bg-[#0B1A4E] sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold tracking-wider">NIF</th>
                                            <th className="px-6 py-3 font-semibold tracking-wider">Nome</th>
                                            <th className="px-6 py-3 font-semibold tracking-wider">E-mail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {paginatedUsers.length > 0 ? paginatedUsers.map(u => (
                                            <tr
                                                key={u.id}
                                                onClick={() => setSelectedUser(u)}
                                                className={`cursor-pointer transition-all border-l-4 ${selectedUser?.nif === u.nif ? 'bg-sky-100 border-l-sky-600' : 'bg-white hover:bg-gray-50 border-l-transparent hover:border-l-gray-300'}`}
                                            >
                                                <td className="px-6 py-3 font-medium text-gray-900">{u.nif}</td>
                                                <td className="px-6 py-3 text-gray-700 font-semibold">{u.name}</td>
                                                <td className="px-6 py-3 text-gray-600">{u.email}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                                    Nenhum usuário encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200 mt-auto">
                                <div className="flex items-center space-x-2 mx-auto">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <span className="w-6 h-6 flex items-center justify-center bg-sky-500 text-white font-bold rounded-full text-xs">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Section: Always Visible */}
                    <form id="access-form" onSubmit={handleConfirm} className={`space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${!isEditing ? 'basis-[40%] pl-8 border-l border-gray-200' : ''}`}>
                        <div className="flex items-center space-x-2 text-[#0B1A4E] border-b border-gray-200 pb-2 mt-8">
                            <InformationCircleIcon className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">
                                {isEditing ? 'Dados do Usuário' : '2. Configurar Acesso'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Nome</label>
                                <p className="text-sm font-bold text-gray-800">{selectedUser?.name || '-'}</p>
                            </div>
                            <div className="text-right sm:text-left">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">NIF</label>
                                <p className="text-sm font-bold text-gray-800">{selectedUser?.nif || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">E-mail</label>
                                <p className="text-sm text-gray-700">{selectedUser?.email || '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <MultiSelectDropdown
                                    label="Perfis de Acesso:"
                                    options={profileOptions}
                                    selectedValues={selectedProfiles}
                                    onChange={(vals) => {
                                        setSelectedProfiles(vals);
                                        setError(null);
                                    }}
                                    placeholder="Selecione os perfis..."
                                />
                            </div>

                            <div>
                                <MultiSelectDropdown
                                    label="Unidades com Acesso:"
                                    options={unitOptions}
                                    selectedValues={selectedUnits}
                                    onChange={(vals) => {
                                        setSelectedUnits(vals);
                                        setError(null);
                                    }}
                                    placeholder="Selecione as unidades..."
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">
                                    * Obrigatório, exceto para Administradores.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded flex items-center gap-2">
                                <InformationCircleIcon className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end items-center space-x-4 pt-6 mt-auto">
                            <button
                                onClick={onClose}
                                type="button"
                                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors uppercase tracking-wide"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedUser}
                                className={`px-6 py-2.5 rounded-md font-bold transition-all flex items-center space-x-2 shadow-lg uppercase tracking-wide text-sm ${selectedUser ? 'bg-[#0EA5E9] text-white hover:bg-sky-600 shadow-sky-100' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                                <span>{isEditing ? 'Atualizar Acesso' : 'Vincular Acesso'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccessRegistrationModal;
