
import React, { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon, TrashIcon, CheckCircleIcon, InformationCircleIcon, XMarkIcon, PaperAirplaneIcon } from './Icons';
import type { AccessProfile } from '../types';

const MENUS = [
    {
        name: 'Home',
        items: [
            { id: 'home', label: 'Home', backendKeys: ['Home'] }
        ]
    },
    {
        name: 'Menu Solicitações',
        items: [
            { id: 'solicitacoes', label: 'Solicitações gerais', backendKeys: ['Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF)', 'Menu Solicitações:Gerais (PDF + Ciência)', 'Menu Solicitações:Gerais (PDF)'] },
            { id: 'solicitacoes_reclassificacao', label: 'Solicitações para reclassificação', backendKeys: ['Menu Solicitações:Reclassificação'] },
            { id: 'aprovacao', label: 'Solicitações para aprovação', backendKeys: ['Menu Solicitações:Aprovação'] },
            { id: 'manutencao', label: 'Manutenção', backendKeys: ['Menu Solicitações:Manutenção'] }
        ]
    },
    {
        name: 'Abrir Solicitações',
        items: [
            { id: 'nova_estrategica', label: 'Abrir Estratégica', backendKeys: ['Abrir Solicitações:Estratégica'] },
            { id: 'nova_sede', label: 'Abrir Sede', backendKeys: ['Abrir Solicitações:Sede'] },
            { id: 'nova_unidade', label: 'Abrir Unidade', backendKeys: ['Abrir Solicitações:Unidade'] }
        ]
    },
    {
        name: 'Gerenciamento',
        items: [
            { id: 'planejamento', label: 'Planejamento', backendKeys: ['Gerenciamento:Planejamento'] },
            { id: 'plurianual', label: 'Plurianual', backendKeys: ['Gerenciamento:Plurianual'] }
        ]
    },
    {
        name: 'Configurações',
        items: [
            { id: 'gestao_acesso', label: 'Gestão acesso', backendKeys: ['Configurações:Gestão de acesso'] },
            { id: 'perfil_acesso', label: 'Perfil acesso', backendKeys: ['Configurações:Perfil Acesso'] },
            { id: 'gerenciador_arquivos', label: 'Arquivos', backendKeys: ['Configurações:Arquivos'] },
            { id: 'painel_criticidade', label: 'Criticidade', backendKeys: ['Configurações:Criticidade'] },
            { id: 'avisos_globais', label: 'Gerenciamento de avisos', backendKeys: ['Configurações:Gerenciamento de Avisos'] },
            { id: 'notificacoes_requisitos', label: 'Notificações e requisitos', backendKeys: ['Configurações:Notificações'] },
            { id: 'cadastro_periodos', label: 'Período Solicitação', backendKeys: ['Configurações:Periodo de solicitação'] },
            { id: 'cadastro_tipo_local', label: 'Tipo local', backendKeys: ['Configurações:Tipolocal'] },
            { id: 'tipologias', label: 'Tipologia', backendKeys: ['Configurações:Tipologia'] },
            { id: 'cadastro_unidades', label: 'Unidades', backendKeys: ['Configurações:Unidades'] }
        ]
    }
];

interface NewProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, permissions: string[]) => void;
}

const NewProfileModal: React.FC<NewProfileModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<string[]>(['home']);

    if (!isOpen) return null;

    const handleToggle = (id: string) => {
        setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        if (!name.trim()) return;
        onSave(name, permissions);
        setName('');
        setPermissions(['home']);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[110] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">Novo Perfil de Acesso</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Nome do Perfil</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Gestor Regional"
                            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Selecione as Funcionalidades</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                            {MENUS.map(menu => (
                                <div key={menu.name} className="space-y-1.5">
                                    <h4 className="text-[10px] font-bold text-sky-600 uppercase tracking-widest border-b border-sky-50 pb-0.5">{menu.name}</h4>
                                    {menu.items.map(item => {
                                        const isChecked = permissions.includes(item.id);
                                        const isRestricted = item.id === 'perfil_acesso';

                                        return (
                                            <label
                                                key={item.id}
                                                className={`flex items-center group p-1 -ml-1 rounded-md transition-all ${isRestricted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggle(item.id)}
                                                    disabled={isRestricted}
                                                    className={`h-4 w-4 rounded border-gray-300 ${isChecked ? 'text-red-600 focus:ring-red-500' : 'text-sky-600 focus:ring-sky-500'}`}
                                                />
                                                <span className={`ml-3 text-sm font-medium transition-colors ${isChecked ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                                                    {item.label}
                                                    {isRestricted && <span className="ml-2 text-[9px] text-red-400 font-bold italic">(Restrito ao Admin)</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors uppercase">Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                        className="bg-[#0EA5E9] text-white px-10 py-2 rounded-md font-bold hover:bg-sky-600 transition-all flex items-center space-x-2 shadow-lg disabled:bg-gray-400 uppercase"
                    >
                        <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                        <span>Cadastrar Perfil</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface AccessProfileScreenProps {
    profiles: AccessProfile[];
    setProfiles: React.Dispatch<React.SetStateAction<AccessProfile[]>>;
}

const AccessProfileScreen: React.FC<AccessProfileScreenProps> = ({ profiles, setProfiles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    // States for Edit Mode
    const [isEditingExisting, setIsEditingExisting] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPermissions, setEditPermissions] = useState<string[]>([]);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
    };

    const selectedProfile = useMemo(() =>
        profiles.find(p => p.id === selectedProfileId) || profiles[0]
        , [profiles, selectedProfileId]);

    // Update edit states when changing selected profile IF not in edit mode
    useEffect(() => {
        if (!isEditingExisting && selectedProfile) {
            setEditName(selectedProfile.name);
            setEditPermissions(selectedProfile.permissions);
        }
    }, [selectedProfileId, selectedProfile, isEditingExisting]);

    const filteredProfiles = useMemo(() =>
        profiles.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        , [profiles, searchTerm]);

    const handleTogglePermission = (keys: string[]) => {
        if (!isEditingExisting) return;

        // Logic for restricted screens: only Admin can have 'perfil_acesso'
        const isAdmin = editName === 'Administração do Sistema' || editName === 'Administrador do sistema';
        const isRestricted = keys.includes('Configurações:Perfil Acesso');

        if (isRestricted && !isAdmin) return;

        setEditPermissions(prev => {
            if (prev.includes('*')) {
                // If we are unchecking something while having '*', we switch to "all except this"
                // But '*' is a wildcard. Ideally we should list all and remove the target.
                // For simplicity, if '*' is present, we first expand it to all available keys minus the one being toggled.
                const allKeys = MENUS.flatMap(m => m.items.flatMap(i => i.backendKeys));
                return allKeys.filter(k => !keys.includes(k));
            }

            const hasAllKeys = keys.every(k => prev.includes(k));

            if (hasAllKeys) {
                // Remove keys
                return prev.filter(k => !keys.includes(k));
            } else {
                // Add keys (avoid duplicates)
                const newKeys = [...prev];
                keys.forEach(k => {
                    if (!newKeys.includes(k)) newKeys.push(k);
                });
                return newKeys;
            }
        });
    };

    const handleEditToggle = () => {
        if (isEditingExisting) {
            if (!editName.trim()) {
                showToast('O nome do perfil não pode estar vazio.', 'error');
                return;
            }
            setProfiles(prev => prev.map(p =>
                p.id === selectedProfileId
                    ? { ...p, name: editName.trim(), permissions: editPermissions }
                    : p
            ));
            setIsEditingExisting(false);
            showToast('Configurações de perfil salvas com sucesso!', 'success');
        } else {
            setEditName(selectedProfile.name);
            setEditPermissions(selectedProfile.permissions);
            setIsEditingExisting(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingExisting(false);
        setEditName(selectedProfile.name);
        setEditPermissions(selectedProfile.permissions);
    };

    const handleNewProfile = async (name: string, permissions: string[]) => {
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, permissions, category: 'GERAL' })
            });

            if (response.ok) {
                const resData = await response.json();
                const newProfile: AccessProfile = {
                    id: resData.id,
                    name,
                    permissions
                };
                setProfiles(prev => [...prev, newProfile]);
                setSelectedProfileId(newProfile.id);
                setIsNewModalOpen(false);
                showToast('Perfil cadastrado com sucesso!', 'success');
            } else {
                showToast('Erro ao cadastrar perfil.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
    };

    const handleDeleteProfile = () => {
        if (selectedProfile.name === 'Administração do Sistema') {
            showToast('O perfil Administração do Sistema não pode ser excluído.', 'error');
            return;
        }
        if (confirm(`Deseja realmente excluir o perfil ${selectedProfile.name}?`)) {
            const nextProfiles = profiles.filter(p => p.id !== selectedProfileId);
            setProfiles(nextProfiles);
            setSelectedProfileId(nextProfiles[0]?.id || '');
            showToast('Perfil excluído com sucesso.', 'success');
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const profileColors: { [key: string]: string } = {
        'Administração do Sistema': 'bg-pink-600',
        'Alta Administração Senai': 'bg-orange-500',
        'Solicitação Unidade': 'bg-blue-600',
        'Gestor GSO': 'bg-purple-600',
        'Diretoria Corporativa': 'bg-green-600',
        'Gerência de Infraestrutura e Suprimento': 'bg-sky-500',
        'Gestor Local': 'bg-indigo-500',
    };

    const getProfileColor = (name: string) => {
        return profileColors[name] || `bg-slate-400`;
    };

    if (!selectedProfile && profiles.length > 0) return <div>Carregando...</div>;

    return (
        <div className="flex flex-col h-full space-y-6">
            {toast?.isVisible && (
                <div className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Header / Top Toolbar */}
            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Perfil acesso</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-[#0B1A4E] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-sm"
                    >
                        + Novo
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Panel: Profile List */}
                <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isEditingExisting}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-md text-sm focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredProfiles.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => !isEditingExisting && setSelectedProfileId(profile.id)}
                                disabled={isEditingExisting && selectedProfileId !== profile.id}
                                className={`w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors group ${selectedProfileId === profile.id ? 'bg-sky-50/20' : ''} ${isEditingExisting && selectedProfileId !== profile.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full ${getProfileColor(profile.name)} text-white flex items-center justify-center font-bold text-xs shrink-0 mr-3 shadow-sm`}>
                                    {getInitials(profile.name)}
                                </div>
                                <span className={`text-xs font-bold leading-tight ${selectedProfileId === profile.id ? 'text-sky-600' : 'text-gray-700'}`}>
                                    {profile.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Functionalites Checklist */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-6 flex-1 overflow-y-auto space-y-8">
                        {selectedProfile && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        value={isEditingExisting ? editName : selectedProfile.name}
                                        onChange={(e) => setEditName(e.target.value)}
                                        readOnly={!isEditingExisting}
                                        className={`w-full border-none rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${isEditingExisting ? 'bg-white ring-2 ring-sky-100 text-gray-900' : 'bg-gray-50 text-gray-700'}`}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-6">Funcionalidades</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
                                        {MENUS.map(menu => (
                                            <div key={menu.name} className="space-y-1.5">
                                                <h4 className="text-[10px] font-bold text-sky-600 uppercase tracking-widest border-b border-sky-50 pb-1">{menu.name}</h4>
                                                <div className="space-y-1">
                                                    {menu.items.map(item => {
                                                        const currentPermissions = isEditingExisting ? editPermissions : selectedProfile.permissions;

                                                        // Check if ALL backend keys for this item are present, or if '*' (Admin) is present
                                                        const isChecked = currentPermissions.includes('*') || item.backendKeys.some(k => currentPermissions.includes(k));

                                                        const isPermissionRestricted = (item.id === 'perfil_acesso' && editName !== 'Administração do Sistema' && editName !== 'Administrador do sistema');
                                                        const isDisabled = !isEditingExisting || isPermissionRestricted;

                                                        return (
                                                            <label
                                                                key={item.id}
                                                                className={`flex items-center group p-1 -ml-1 rounded-md transition-all ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                <div className="relative flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => handleTogglePermission(item.backendKeys)}
                                                                        disabled={isDisabled}
                                                                        className={`h-4 w-4 rounded border-gray-300 transition-all ${isChecked ? 'text-red-600 focus:ring-red-500' : 'text-sky-600 focus:ring-sky-500'} ${isDisabled ? 'opacity-40' : ''}`}
                                                                    />
                                                                </div>
                                                                <span className={`ml-3 text-sm font-medium transition-colors ${isChecked ? 'text-red-600 font-bold' : (!isDisabled ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400')}`}>
                                                                    {item.label}
                                                                    {isPermissionRestricted && (
                                                                        <span className={`ml-2 text-[9px] font-bold italic uppercase tracking-tighter ${isEditingExisting ? 'text-red-400' : 'text-gray-400'}`}>
                                                                            (Apenas Administrador)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
                        {isEditingExisting && (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors uppercase"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteProfile}
                                    disabled={selectedProfile?.name === 'Administração do Sistema'}
                                    className="px-6 py-2 border border-red-300 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 flex items-center disabled:opacity-50 transition-colors uppercase"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" /> Excluir
                                </button>
                            </>
                        )}
                        {selectedProfile && (
                            <button
                                onClick={handleEditToggle}
                                className="px-10 py-2 bg-[#0EA5E9] text-white rounded-md text-sm font-bold hover:bg-sky-600 transition-all shadow-md active:transform active:scale-95 uppercase"
                            >
                                {isEditingExisting ? 'Salvar' : 'Editar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <NewProfileModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSave={handleNewProfile}
            />
        </div>
    );
};

export default AccessProfileScreen;
