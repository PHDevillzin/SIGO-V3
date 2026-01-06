
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PaperAirplaneIcon, InformationCircleIcon } from './Icons';
import { MultiSelectDropdown } from './AdvancedFilters';
import type { User, Unit, AccessProfile } from '../types';

interface AccessRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onConfirm: (data: { profiles: string[], units: string[] }) => void;
    units: Unit[];
    profiles: AccessProfile[];
}

const AccessRegistrationModal: React.FC<AccessRegistrationModalProps> = ({ isOpen, onClose, user, onConfirm, units, profiles }) => {
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Dynamic unit options based on units registered in the system
    const unitOptions = useMemo(() => {
        return Array.from(new Set(units.map(u => u.unidade))).sort();
    }, [units]);

    // Dynamic profile options based on profiles managed in the AccessProfileScreen
    const profileOptions = useMemo(() => {
        return profiles.map(p => p.name).sort();
    }, [profiles]);

    useEffect(() => {
        if (isOpen && user) {
            setSelectedProfiles(user.sigoProfiles || []);
            setSelectedUnits(user.linkedUnits || []);
            setError(null);
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const isEditing = !!user.registrationDate;

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProfiles.length === 0) {
            setError('Por favor, selecione ao menos um perfil de acesso.');
            return;
        }
        if (selectedUnits.length === 0) {
            setError('Por favor, selecione ao menos uma unidade.');
            return;
        }
        onConfirm({ profiles: selectedProfiles, units: selectedUnits });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">
                        {isEditing ? 'Editar Acesso do Usuário' : 'Vincular Acesso ao Usuário'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="p-8 space-y-6 bg-white">
                    {/* User Info Read Only */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50 rounded-lg border border-sky-100">
                        <div>
                            <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Nome</label>
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">NIF</label>
                            <p className="text-sm font-semibold text-gray-800">{user.nif}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">E-mail</label>
                            <p className="text-sm text-gray-700">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Profile MultiSelect */}
                        <div>
                            <MultiSelectDropdown 
                                label="Perfis de Acesso:"
                                options={profileOptions}
                                selectedValues={selectedProfiles}
                                onChange={(vals) => {
                                    setSelectedProfiles(vals);
                                    if (error) setError(null);
                                }}
                                placeholder="Vincular perfis..."
                            />
                        </div>

                        {/* Units MultiSelect */}
                        <div>
                            <MultiSelectDropdown 
                                label="Unidades com Acesso:"
                                options={unitOptions}
                                selectedValues={selectedUnits}
                                onChange={(vals) => {
                                    setSelectedUnits(vals);
                                    if (error) setError(null);
                                }}
                                placeholder="Vincular unidades..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                * O usuário terá visibilidade total sobre as demandas destas unidades.
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

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-gray-50 flex justify-end items-center space-x-3 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors uppercase"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="bg-[#0EA5E9] text-white px-8 py-2 rounded-md font-bold hover:bg-sky-600 transition-all flex items-center space-x-2 shadow-lg shadow-sky-100 uppercase"
                    >
                        <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                        <span>{isEditing ? 'Atualizar Dados' : 'Confirmar Cadastro'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRegistrationModal;
