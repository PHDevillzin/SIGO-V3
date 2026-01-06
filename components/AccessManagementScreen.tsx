
import React, { useState, useMemo, useEffect } from 'react';
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
}

const AccessManagementScreen: React.FC<AccessManagementScreenProps> = ({ units, profiles }) => {
    const [allUsers] = useState<User[]>(csvDataRaw as User[]); // Keep "csvDataRaw" as source for "Available" for now if dynamic fetching isn't ready for "Source"
    const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter or map if necessary. "Registered Users" are those in the DB.
                    // The UI distinguishes between "CSV Source" (Available) and "Registered".
                    // If the API returns all users, we might need to split them or just use the API for Registered.
                    // For now, let's assume API users = Registered Users.
                    setRegisteredUsers(data);
                }
            })
            .catch(err => console.error('Failed to fetch users', err));
    }, []);
    const [filterText, setFilterText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserForRegistration, setSelectedUserForRegistration] = useState<User | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', visible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
    };

    const filteredSourceUsers = useMemo(() => {
        return allUsers.filter(user => {
            const matchesFilter = user.name.toLowerCase().includes(filterText.toLowerCase()) || 
                                user.nif.toLowerCase().includes(filterText.toLowerCase());
            const isAlreadyRegistered = registeredUsers.some(reg => reg.nif === user.nif);
            return matchesFilter && !isAlreadyRegistered;
        });
    }, [allUsers, registeredUsers, filterText]);

    const handleRegisterClick = (user: User) => {
        setSelectedUserForRegistration(user);
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUserForRegistration(user);
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

    const handleConfirmRegistration = (data: { profiles: string[], units: string[] }) => {
        if (!selectedUserForRegistration) return;
        
        const isEditing = !!selectedUserForRegistration.registrationDate;
        
        const updatedUser: User = {
            ...selectedUserForRegistration,
            sigoProfiles: data.profiles,
            linkedUnits: data.units,
            registrationDate: selectedUserForRegistration.registrationDate || new Date().toLocaleDateString('pt-BR')
        };
        
        if (isEditing) {
            setRegisteredUsers(prev => prev.map(u => u.nif === updatedUser.nif ? updatedUser : u));
            showToast('Acesso atualizado com sucesso!', 'success');
        } else {
            setRegisteredUsers(prev => [updatedUser, ...prev]);
            showToast('Usuário cadastrado com sucesso!', 'success');
        }
        setIsModalOpen(false);
        setSelectedUserForRegistration(null);
    };

    return (
        <div className="space-y-8">
            {toast?.visible && (
                <div className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-all duration-500 ease-in-out bg-green-600`}>
                    <CheckCircleIcon className="w-6 h-6" />
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestão de acessos</h1>
            </div>

            {/* Source Users Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-sky-500" />
                    Usuários Disponíveis para Cadastro (Fonte CSV)
                </h2>
                
                {/* Filter */}
                <div className="relative max-w-md mb-6">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Filtrar por Nome ou NIF..." 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">NIF</th>
                                <th className="px-6 py-4 font-semibold">Nome</th>
                                <th className="px-6 py-4 font-semibold">E-mail</th>
                                <th className="px-6 py-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredSourceUsers.length > 0 ? filteredSourceUsers.map(user => (
                                <tr key={user.id} className="bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nif}</td>
                                    <td className="px-6 py-4 text-gray-700">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleRegisterClick(user)}
                                            className="bg-[#0EA5E9] text-white px-3 py-1.5 rounded-md hover:bg-sky-600 transition-colors flex items-center gap-1 mx-auto text-xs font-bold shadow-sm"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            CADASTRAR
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                        Nenhum usuário disponível com os filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                            {registeredUsers.length > 0 ? registeredUsers.map(user => (
                                <tr key={user.nif} className="bg-white hover:bg-gray-50 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nif}</td>
                                    <td className="px-6 py-4 text-gray-700">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.sigoProfiles?.map(profile => (
                                                <span key={profile} className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] border border-sky-100 font-bold uppercase">
                                                    {profile}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="flex flex-wrap gap-1">
                                            {user.linkedUnits?.map(unit => (
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
                                        Nenhum usuário cadastrado até o momento.
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
