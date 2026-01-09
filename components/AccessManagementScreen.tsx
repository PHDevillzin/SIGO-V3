
import React, { useState, useMemo } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon
} from './Icons';

import AccessDetailsModal from './AccessDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import type { User, Unit, AccessProfile } from '../types';

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);



interface AccessManagementScreenProps {
    units: Unit[];
    profiles: AccessProfile[];
    registeredUsers: User[];
    setRegisteredUsers: React.Dispatch<React.SetStateAction<User[]>>;
    userPermissions: string[];
    currentUser: User;
    selectedProfile: string;
    onNavigateToRegistration: () => void;
    onNavigateToEdit: (user: User) => void;
}

const AccessManagementScreen: React.FC<AccessManagementScreenProps> = ({
    units,
    profiles,
    registeredUsers,
    setRegisteredUsers,
    userPermissions,
    currentUser,
    selectedProfile,
    onNavigateToRegistration,
    onNavigateToEdit
}) => {
    const isAdmin = userPermissions.includes('*') || userPermissions.includes('all');
    const isGestorLocal = selectedProfile === 'Gestor Local';

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', visible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
    };

    // Derived list for the Grid: Only show users with profiles
    // Restriction: Gestor Local only sees users dealing with their units
    const usersWithAccess = useMemo(() => {
        const activeUsers = registeredUsers.filter(u => u.sigoProfiles && u.sigoProfiles.length > 0);

        if (isGestorLocal) {
            const myUnits = currentUser.linkedUnits || [];
            return activeUsers.filter(u => {
                const theirUnits = u.linkedUnits || [];
                // Check intersection: Does the user have ANY unit that I also have?
                // Or check if they were created by me? (Ambiguous, let's stick to Unit intersection as per prompt "para as unidades que ele possui")
                const hasCommonUnit = theirUnits.some(unit => myUnits.includes(unit));
                return hasCommonUnit;
            });
        }

        return activeUsers;
    }, [registeredUsers, isGestorLocal, currentUser]);

    const handleNewUserClick = () => {
        onNavigateToRegistration();
    };

    const handleEditClick = (user: User) => {
        onNavigateToEdit(user);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                const response = await fetch(`/api/users?nif=${userToDelete.nif}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setRegisteredUsers(prev => prev.filter(u => u.nif !== userToDelete.nif));
                    showToast('Usuário removido da base de dados com sucesso.', 'success');
                } else {
                    const err = await response.json();
                    showToast(`Erro ao excluir: ${err.error || 'Erro desconhecido'}`, 'error');
                }
            } catch (error) {
                console.error("Failed to delete user", error);
                showToast('Erro de conexão ao excluir usuário.', 'error');
            }
        }
        setIsDeleteConfirmOpen(false);
        setUserToDelete(null);
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.isActive;
        // Optimistic update
        setRegisteredUsers(prev => prev.map(u => u.nif === user.nif ? { ...u, isActive: newStatus } : u));

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nif: user.nif,
                    name: user.name,
                    email: user.email,
                    isActive: newStatus
                }),
            });

            if (response.ok) {
                showToast(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`, 'success');
            } else {
                // Revert
                setRegisteredUsers(prev => prev.map(u => u.nif === user.nif ? { ...u, isActive: !newStatus } : u));
                showToast('Erro ao atualizar status.', 'error');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            // Revert
            setRegisteredUsers(prev => prev.map(u => u.nif === user.nif ? { ...u, isActive: !newStatus } : u));
            showToast('Erro de conexão.', 'error');
        }
    };



    return (
        <div className="space-y-8">
            {toast?.visible && (
                <div className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <CheckCircleIcon className="w-6 h-6" />
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Gestão de acessos</h1>
                <button
                    onClick={handleNewUserClick}
                    className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 text-sm tracking-wide"
                >
                    <PlusIcon className="w-5 h-5" />
                    Cadastrar
                </button>
            </div>

            {/* Registered Users Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Usuários Cadastrados no Sistema
                </h2>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">NIF</th>
                                <th className="px-6 py-4 font-semibold">Nome</th>
                                <th className="px-6 py-4 font-semibold">E-mail</th>
                                <th className="px-6 py-4 font-semibold">Perfis SIGO</th>
                                <th className="px-6 py-4 font-semibold">Unidades Vinculadas</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {usersWithAccess.length > 0 ? usersWithAccess.map(user => (
                                <tr key={user.nif} className="bg-white hover:bg-gray-50 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nif}</td>
                                    <td className="px-6 py-4 text-gray-700">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.sigoProfiles
                                                ?.filter(pId => {
                                                    const p = profiles.find(pr => pr.id === pId);
                                                    return p && p.name !== 'Administrador do sistema' && p.name !== 'Administração do sistema';
                                                })
                                                .map(profileId => {
                                                    const profile = profiles.find(p => p.id === profileId);
                                                    return (
                                                        <span key={profileId} className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] border border-sky-100 font-bold uppercase">
                                                            {profile ? profile.name : profileId}
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="flex flex-wrap gap-1">
                                            {user.linkedUnits?.map((unit: string) => (
                                                <span key={unit} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] border border-gray-200">
                                                    {unit}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ToggleSwitch
                                            checked={!!user.isActive}
                                            onChange={() => handleToggleStatus(user)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUserForView(user);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1.5 bg-sky-100 text-sky-600 rounded-md hover:bg-sky-200 transition-colors"
                                                title="Visualizar Detalhes"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-1.5 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
                                                title="Editar Acesso"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                title="Excluir Acesso"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        Nenhum usuário com acesso cadastrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>



            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Cadastro de Acesso"
                message={`Deseja realmente excluir todos os acessos e perfis de ${userToDelete?.name}? O usuário voltará para a lista de disponíveis para novo cadastro.`}
                confirmLabel="Excluir"
                cancelLabel="Não"
            />

            <AccessDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                user={selectedUserForView}
                profiles={profiles}
            />
        </div>
    );
};
export default AccessManagementScreen;
