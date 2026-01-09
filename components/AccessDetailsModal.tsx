import React, { useMemo } from 'react';
import { XMarkIcon, UserIcon, MapPinIcon, ShieldCheckIcon } from './Icons';
import type { User, AccessProfile } from '../types';
import { MENUS } from './constants';

interface AccessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    profiles: AccessProfile[];
}

const AccessDetailsModal: React.FC<AccessDetailsModalProps> = ({ isOpen, onClose, user, profiles }) => {
    if (!isOpen || !user) return null;

    // Aggregate Permissions
    const aggregatedPermissions = useMemo(() => {
        const userProfileIds = user.sigoProfiles || [];
        // Get all profiles assigned to the user
        const assignedProfiles = profiles.filter(p => userProfileIds.includes(p.id));

        // Collect all permissions from all assigned profiles
        const allPerms = assignedProfiles.flatMap(p => p.permissions);

        // Return unique set
        return Array.from(new Set(allPerms));
    }, [user, profiles]);

    const userProfileValues = useMemo(() => {
        const userProfileIds = user.sigoProfiles || [];
        const filtered = profiles.filter(p => userProfileIds.includes(p.id) && p.name !== 'Administrador do sistema' && p.name !== 'Administração do sistema');

        // Apply consistent sorting
        return filtered.sort((a, b) => {
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
    }, [user, profiles])

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[120] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] xl:max-w-7xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="bg-sky-100 p-2 rounded-full">
                            <UserIcon className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Detalhes do Acesso</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Visualização Completa</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content - Side by Side Layout for Landscape */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                    {/* LEFT PANEL: User Info & Assignments (Scrollable independently if needed) */}
                    <div className="w-full lg:w-1/3 min-w-[320px] bg-gray-50/50 p-6 lg:p-8 border-r border-gray-100 overflow-y-auto">
                        <div className="space-y-8">
                            {/* User Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dados do Usuário</h3>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Nome</label>
                                        <div className="font-semibold text-gray-800 text-sm md:text-base">{user.name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">NIF</label>
                                            <div className="font-semibold text-gray-800 text-sm md:text-base">{user.nif}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">E-mail</label>
                                            <div className="font-semibold text-gray-800 text-sm md:text-base truncate" title={user.email}>{user.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profiles Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 flex items-center mb-3">
                                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-sky-500" />
                                    Perfis Atribuídos
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {userProfileValues.length > 0 ? (
                                        userProfileValues.map(profile => (
                                            <span key={profile.id} className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold border border-sky-200 shadow-sm">
                                                {profile.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Nenhum perfil atribuído.</span>
                                    )}
                                </div>
                            </div>

                            {/* Units Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 flex items-center mb-3">
                                    <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
                                    Unidades Vinculadas
                                </h3>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                    {user.linkedUnits && user.linkedUnits.length > 0 ? (
                                        user.linkedUnits.map(unit => (
                                            <span key={unit} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
                                                {unit}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Nenhuma unidade vinculada.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Permissions Matrix (Scrollable) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
                            Permissões Consolidadas
                            <span className="ml-3 text-xs font-normal text-white bg-green-500 px-2 py-0.5 rounded-full">Soma de todos os perfis</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
                            {MENUS.map(menu => (
                                <div key={menu.name} className="space-y-3 break-inside-avoid">
                                    <h4 className="text-xs font-bold text-sky-700 uppercase tracking-widest border-b border-sky-100 pb-1">{menu.name}</h4>
                                    <div className="space-y-2">
                                        {menu.items.map(item => {
                                            // Check if user has this permission (considering Admin '*' or explicit key)
                                            const hasAccess = aggregatedPermissions.includes('*') || aggregatedPermissions.includes('all') || item.backendKeys.some(k => aggregatedPermissions.includes(k));

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center p-2 rounded-md transition-colors ${hasAccess ? 'bg-green-50 border border-green-100' : 'opacity-40 grayscale'}`}
                                                >
                                                    <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center mr-3 ${hasAccess ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                                                        {hasAccess && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <span className={`text-xs font-medium ${hasAccess ? 'text-green-800' : 'text-gray-500'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 text-white px-8 py-2 rounded-md font-bold hover:bg-gray-900 transition-colors shadow-lg uppercase text-xs tracking-wide"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDetailsModal;
