
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PaperAirplaneIcon, InformationCircleIcon, MagnifyingGlassIcon, PlusIcon } from './Icons';
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
    // Selection State (for Create Mode)
    const [selectedUser, setSelectedUser] = useState<User | null>(initialUser);
    const [filterText, setFilterText] = useState('');

    // Form State
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedUser(initialUser);
            setFilterText('');
            if (initialUser) {
                // Pre-fill for Edit Mode
                setSelectedProfiles(initialUser.sigoProfiles || []);
                setSelectedUnits(initialUser.linkedUnits || []);
            } else {
                // Reset for Create Mode
                setSelectedProfiles([]);
                setSelectedUnits([]);
            }
            setError(null);
        }
    }, [isOpen, initialUser]);

    // Dynamic unit options
    const unitOptions = useMemo(() => {
        return Array.from(new Set(units.map(u => u.unidade))).sort();
    }, [units]);

    // Dynamic profile options
    const profileOptions = useMemo(() => {
        return profiles.map(p => p.name).sort();
    }, [profiles]);

    // Filter source users
    const filteredSourceUsers = useMemo(() => {
        return sourceUsers.filter(u => 
            u.name.toLowerCase().includes(filterText.toLowerCase()) || 
            u.nif.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [sourceUsers, filterText]);

    if (!isOpen) return null;

    const isEditing = !!initialUser?.registrationDate;
    const isSelectionStep = !selectedUser && !isEditing;

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProfiles.length === 0) {
            setError('Por favor, selecione ao menos um perfil de acesso.');
            return;
        }
        // Unit is optional for Admin, strictly separate logic might be needed, 
        // but for now let's keep it required unless specifically asked to relax.
        // User said: "Important: para o perfil 'Administração do sistema' não há necessidade de ter unidade vinculada."
        // Let's relax the check if Admin is selected.
        const isAdmin = selectedProfiles.includes('Administração do sistema');
        
        if (selectedUnits.length === 0 && !isAdmin) {
             setError('Por favor, selecione ao menos uma unidade (ou Perfil Administrador).');
             return;
        }

        onConfirm({ 
            profiles: selectedProfiles, 
            units: selectedUnits,
            selectedUser: selectedUser || undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className={`bg-white rounded-lg shadow-2xl w-full ${isSelectionStep ? 'max-w-4xl' : 'max-w-2xl'} animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg shrink-0">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">
                        {isSelectionStep ? 'Selecionar Usuário para Cadastro' : (isEditing ? 'Editar Acesso do Usuário' : 'Vincular Acesso')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-8 space-y-8">
                    {/* Grid Section - Visible if NOT editing (Create Mode) */}
                    {!isEditing && (
                         <div className="space-y-6">
                            <div className="relative max-w-md">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar por Nome ou NIF..." 
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans text-sm"
                                    autoFocus // Focus here first
                                />
                            </div>

                            <div className="border rounded-lg overflow-hidden shadow-sm max-h-[250px] overflow-y-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-white uppercase bg-[#0B1A4E] sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">NIF</th>
                                            <th className="px-6 py-4 font-semibold">Nome</th>
                                            <th className="px-6 py-4 font-semibold">E-mail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredSourceUsers.length > 0 ? filteredSourceUsers.map(u => (
                                            <tr 
                                                key={u.id} 
                                                onClick={() => setSelectedUser(u)}
                                                className={`cursor-pointer transition-colors border-l-4 ${selectedUser?.nif === u.nif ? 'bg-sky-50 border-sky-500' : 'bg-white hover:bg-gray-50 border-transparent'}`}
                                            >
                                                <td className="px-6 py-3 font-medium text-gray-900">{u.nif}</td>
                                                <td className="px-6 py-3 text-gray-700 font-semibold">{u.name}</td>
                                                <td className="px-6 py-3">{u.email}</td>
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
                        </div>
                    )}

                    {/* Form Section - Visible if User Selected */}
                    {selectedUser && (
                        <form id="access-form" onSubmit={handleConfirm} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center space-x-2 text-sky-800 border-b border-sky-100 pb-2">
                                <InformationCircleIcon className="w-5 h-5" />
                                <h3 className="font-bold text-sm uppercase tracking-wide">
                                    {isEditing ? 'Dados do Usuário' : 'Vincular Acesso para:'}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50 rounded-lg border border-sky-100">
                                <div>
                                    <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Nome</label>
                                    <p className="text-sm font-semibold text-gray-800">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">NIF</label>
                                    <p className="text-sm font-semibold text-gray-800">{selectedUser.nif}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">E-mail</label>
                                    <p className="text-sm text-gray-700">{selectedUser.email}</p>
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
                                            if (error) setError(null);
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
                                            if (error) setError(null);
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
                        </form>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-gray-50 flex justify-end items-center space-x-3 rounded-b-lg shrink-0">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors uppercase"
                    >
                        Cancelar
                    </button>
                    <button 
                        form="access-form" // Link to form
                        type="submit"
                        disabled={!selectedUser}
                        className={`px-8 py-2 rounded-md font-bold transition-all flex items-center space-x-2 shadow-lg uppercase ${selectedUser ? 'bg-[#0EA5E9] text-white hover:bg-sky-600 shadow-sky-100' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                        <span>{isEditing ? 'Atualizar' : 'Salvar Cadastro'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRegistrationModal;
