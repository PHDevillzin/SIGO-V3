
import React, { useState, useMemo } from 'react';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    CheckCircleIcon, 
    InformationCircleIcon,
    PencilIcon,
    TrashIcon
} from './Icons';
import AccessRegistrationModal from './AccessRegistrationModal';
import ConfirmationModal from './ConfirmationModal';
import type { User, Unit, AccessProfile } from '../types';

const csvDataRaw = [
    { id: "25", nif: "SS0000002", name: "Ana Beatriz Costa", email: "ana.costa@sesisenaisp.org.br", unidade: "SESI - Campinas", profile: "Unidade", createdBy: "Daniel", createdAt: "10/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "26", nif: "SN0000004", name: "Bruno Alves", email: "bruno.alves@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "12/02/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "27", nif: "SS0000003", name: "Carlos Eduardo Lima", email: "carlos.lima@sesisenaisp.org.br", unidade: "SESI - Jundiaí", profile: "Gestor de unidade", createdBy: "Rafael", createdAt: "05/03/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "28", nif: "SN0000005", name: "Daniela Ferreira", email: "daniela.ferreira@sesisenaisp.org.br", unidade: "SESI - Jundiaí", profile: "Unidade", createdBy: "Teste", createdAt: "18/04/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "29", nif: "SS0000004", name: "Fernando Almeida", email: "fernando.almeida@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "22/07/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "30", nif: "SN0000006", name: "Fernanda Gonçalves", email: "fernanda.goncalves@sesisenaisp.org.br", unidade: "SENAI - Osasco", profile: "Gestor de unidade", createdBy: "Daniel", createdAt: "14/05/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "31", nif: "SS0000005", name: "Gustavo Ribeiro", email: "gustavo.ribeiro@sesisenaisp.org.br", unidade: "SESI - Piracicaba", profile: "Unidade", createdBy: "Teste", createdAt: "30/06/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "32", nif: "SN0000007", name: "Helena Souza", email: "helena.souza@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "09/08/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "33", nif: "SS0000001", name: "Paulo H. R. Silva", email: "paulo.ribeiro.3@sesisenaisp.org.br", unidade: "", profile: "Gerência de Facilities", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "34", nif: "SN0000001", name: "Daniel", email: "daniel@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "35", nif: "SN0000002", name: "Rafael", email: "rafael@sesisenaisp.org.br", unidade: "SENAI - SP - Brás", profile: "Gestor de unidade", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "36", nif: "SN0000003", name: "Teste", email: "teste@sesisenaisp.org.br", unidade: "SENAI - SP - Mooca", profile: "Unidade", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "37", nif: "SN0000008", name: "Ana Silva", email: "ana.silva@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "26/12/2025", updatedAt: "2025-12-26 18:23:14.53+00" }
];

interface AccessManagementScreenProps {
    units: Unit[];
    profiles: AccessProfile[];
    registeredUsers: User[];
    setRegisteredUsers: React.Dispatch<React.SetStateAction<User[]>>;
}


const AccessManagementScreen: React.FC<AccessManagementScreenProps> = ({ units, profiles, registeredUsers, setRegisteredUsers }) => {
    // We keep allUsers as "Source of Truth" for available NIFs (e.g., from CSV/HR System)
    const [sourceUsers] = useState<User[]>(csvDataRaw as User[]); 
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // If null, we are in "Create" mode. If set, we are in "Edit" mode.
    const [selectedUserForRegistration, setSelectedUserForRegistration] = useState<User | null>(null);
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', visible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
    };



    // Filter out already registered users from the source list passed to the modal
    // Only exclude users who are registered AND have at least one profile associated.
    const availableSourceUsers = useMemo(() => {
        return sourceUsers.filter(u => !registeredUsers.some(r => r.nif === u.nif && r.sigoProfiles && r.sigoProfiles.length > 0));
    }, [sourceUsers, registeredUsers]);

    // Derived list for the Grid: Only show users with profiles
    const usersWithAccess = useMemo(() => {
        return registeredUsers.filter(u => u.sigoProfiles && u.sigoProfiles.length > 0);
    }, [registeredUsers]);

    const handleNewUserClick = () => {
        setSelectedUserForRegistration(null); // Create Mode
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUserForRegistration(user); // Edit Mode
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setRegisteredUsers(prev => prev.filter(u => u.nif !== userToDelete.nif));
            showToast('Usuário removido e agora está disponível para novo cadastro.', 'success');
        }
        setIsDeleteConfirmOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmRegistration = async (data: { profiles: string[], units: string[], selectedUser?: User }) => {
        
        // If editing, we use the selectedUserForRegistration.
        // If creating, we MUST have a selectedUser returned from the modal.
        const targetUser = selectedUserForRegistration || data.selectedUser;
        
        if (!targetUser) return;

        const isEditing = !!targetUser.registrationDate;

        // Prepare updated user object
        const updatedUserPayload = {
            ...targetUser,
            sigo_profiles: data.profiles, // Sending IDs as requested
            linked_units: data.units,
            registrationDate: targetUser.registrationDate || new Date().toISOString() // Use ISO for DB consistency if possible, or date string
        };

        try {
            // Call API to persist
            const method = 'PUT'; // Using PUT for upsert/update
            const response = await fetch('/api/users', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nif: updatedUserPayload.nif,
                    // If creating, we need name/email. If editing, they are optional but good to send.
                    name: updatedUserPayload.name, 
                    email: updatedUserPayload.email,
                    sigo_profiles: data.profiles,
                    linked_units: data.units,
                    // Pass ID if available to be safe, though NIF lookup is supported
                    id: targetUser.id 
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save user');
            }
            
            const savedUser = await response.json();
            
            // Simplified: Update local state to reflect change immediately.
            const newUserState: User = {
                ...targetUser,
                sigoProfiles: data.profiles,
                linkedUnits: data.units,
                registrationDate: savedUser.registration_date || updatedUserPayload.registrationDate
            };

            if (isEditing) {
                setRegisteredUsers(prev => prev.map(u => u.nif === newUserState.nif ? newUserState : u));
                showToast('Acesso atualizado com sucesso!', 'success');
            } else {
                 // Check if user already exists locally (e.g. had no profiles, so wasn't in "usersWithAccess" but was in "registeredUsers")
                 // If so, update them. If not, add them.
                 const exists = registeredUsers.some(u => u.nif === newUserState.nif);
                 if (exists) {
                    setRegisteredUsers(prev => prev.map(u => u.nif === newUserState.nif ? newUserState : u));
                 } else {
                    setRegisteredUsers(prev => [newUserState, ...prev]);
                 }
                showToast('Usuário cadastrado com sucesso!', 'success');
            }
            
            setIsModalOpen(false);
            setSelectedUserForRegistration(null);

        } catch (err: any) {
            console.error(err);
            showToast(`Erro ao salvar: ${err.message}`, 'error');
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
                    className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 text-sm uppercase tracking-wide"
                >
                    <PlusIcon className="w-5 h-5" />
                    Novo Usuário
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
                                            {user.sigoProfiles?.map(profileId => {
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
                                        <div className="flex justify-center items-center gap-2">
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

            <AccessRegistrationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUserForRegistration}
                sourceUsers={availableSourceUsers}
                onConfirm={handleConfirmRegistration}
                units={units}
                profiles={profiles}
            />

            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Cadastro de Acesso"
                message={`Deseja realmente excluir todos os acessos e perfis de ${userToDelete?.name}? O usuário voltará para a lista de disponíveis para novo cadastro.`}
                confirmLabel="Excluir"
                cancelLabel="Não"
            />
        </div>
    );
};
export default AccessManagementScreen;
