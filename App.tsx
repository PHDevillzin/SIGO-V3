
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import RequestsTable from './components/RequestsTable';
import PlanningScreen from './components/PlanningScreen';
import PlurianualScreen from './components/PlurianualScreen';
import HomeScreen from './components/HomeScreen';
import TipologiaScreen from './components/TipologiaScreen';
import UnitsScreen from './components/UnitsScreen';
import TipoLocalScreen from './components/TipoLocalScreen';
import AccessManagementScreen from './components/AccessManagementScreen';
import AccessRegistrationScreen from './components/AccessRegistrationScreen';
import AccessProfileScreen from './components/AccessProfileScreen';
import ApprovalRequestsScreen from './components/ApprovalRequestsScreen';
import OpenSedeRequestScreen from './components/OpenSedeRequestScreen';
import OpenStrategicRequestScreen from './components/OpenStrategicRequestScreen';
import OpenUnitRequestScreen from './components/OpenUnitRequestScreen';
import InvestmentPolicyScreen from './components/InvestmentPolicyScreen';
import LoginScreen from './components/LoginScreen';
import { ListIcon } from './components/Icons';
import type { SummaryData, Request, Unit, AccessProfile, User, Tipologia, TipoLocal } from './types';



const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userPermissions, setUserPermissions] = useState<string[]>([]); // New State

    const [selectedProfile, setSelectedProfile] = useState('Gestor GSO');
    const [currentView, setCurrentView] = useState('home');
    const [requests, setRequests] = useState<Request[]>([]);
    const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [profiles, setProfiles] = useState<AccessProfile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [tipologias, setTipologias] = useState<Tipologia[]>([]);
    const [tipoLocais, setTipoLocais] = useState<TipoLocal[]>([]);

    const isSolicitacoesView = ['solicitacoes', 'solicitacoes_reclassificacao', 'manutencao'].includes(currentView);

    let solicitacoesTitle = 'Solicitações';
    if (currentView === 'nova_sede' || currentView === 'nova_estrategica' || currentView === 'nova_unidade') {
        solicitacoesTitle = 'Nova Solicitação';
    } else if (currentView === 'solicitacoes_reclassificacao') {
        solicitacoesTitle = 'Solicitações para Reclassificação';
    } else if (currentView === 'manutencao') {
        solicitacoesTitle = 'Manutenção';
    }

    const handleAddRequest = (newRequest: Request) => {
        setRequests(prevRequests => [...prevRequests, newRequest]);
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            try {
                const [unitsRes, requestsRes, profilesRes, usersRes, tipologiasRes, tipoLocaisRes] = await Promise.all([
                    fetch('/api/units'),
                    fetch('/api/requests'),
                    fetch('/api/profiles'),
                    fetch('/api/users'),
                    fetch('/api/tipologias'),
                    fetch('/api/tipo-locais')
                ]);

                // Determine if user is Admin
                // If '*' permission or 'admin_sys' profile exists
                const isAdmin = userPermissions.includes('all') || userPermissions.includes('*');
                const userLinkedUnits = currentUser?.linkedUnits || [];

                let fetchedProfiles: AccessProfile[] = [];
                if (profilesRes.ok) {
                    fetchedProfiles = await profilesRes.json();
                    setProfiles(fetchedProfiles);
                }

                const currentProfileObj = fetchedProfiles.find(p => p.name === selectedProfile);
                const isGeneralOrCorp = ['GERAL', 'CORPORATIVO'].includes(currentProfileObj?.category || 'GERAL');

                if (unitsRes.ok) {
                    const data = await unitsRes.json();
                    let mappedUnits = data.map((u: any) => ({
                        ...u,
                        codigoUnidade: u.codigo_unidade,
                        responsavelRE: u.responsavel_re,
                        responsavelRA: u.responsavel_ra,
                        responsavelRAR: u.responsavel_rar,
                        tipoDeUnidade: u.tipo_de_unidade,
                        unidadeResumida: u.unidade_resumida,
                        gerenteRegional: u.gerente_regional,
                        emailGR: u.email_gr
                    }));

                    // FILTER UNITS: 
                    // Show all if Admin OR General/Corporate profile
                    // Else show only linked units
                    if (!isAdmin && !isGeneralOrCorp && userLinkedUnits.length > 0) {
                        mappedUnits = mappedUnits.filter((u: Unit) =>
                            userLinkedUnits.includes(u.unidadeResumida) ||
                            userLinkedUnits.includes(u.unidade)
                        );
                    } else if (!isAdmin && !isGeneralOrCorp && userLinkedUnits.length === 0) {
                        // Restricted user with no units
                        mappedUnits = [];
                    }
                    // If Admin or General/Corp, keep all units (mappedUnits)

                    setUnits(mappedUnits);
                }
                if (requestsRes.ok) {
                    const data = await requestsRes.json();
                    let mappedRequests = data.map((r: any) => ({
                        ...r,
                        currentLocation: r.current_location,
                        expectedStartDate: r.expected_start_date,
                        hasInfo: r.has_info,
                        expectedValue: r.expected_value,
                        executingUnit: r.executing_unit,
                        categoriaInvestimento: r.categoria_investimento,
                        situacaoProjeto: r.situacao_projeto,
                        situacaoObra: r.situacao_obra,
                        inicioObra: r.inicio_obra,
                        saldoObraPrazo: r.saldo_obra_prazo,
                        saldoObraValor: r.saldo_obra_valor,
                        gestorLocal: r.gestor_local
                    }));

                    // FILTER REQUESTS: Show only requests from linked units (unless Admin or Sede/Gerencia)
                    // Request field: executingUnit (executing_unit)
                    const isSuperView = isAdmin || currentUser?.sigoProfiles?.includes('sede_solicitante') || currentUser?.sigoProfiles?.includes('gerencia_de_facilities'); // Check slugs

                    if (!isSuperView && userLinkedUnits.length > 0) {
                        mappedRequests = mappedRequests.filter((r: Request) =>
                            userLinkedUnits.includes(r.executingUnit)
                        );
                    } else if (!isSuperView && userLinkedUnits.length === 0) {
                        mappedRequests = [];
                    }

                    setRequests(mappedRequests);
                }

                if (usersRes.ok) {
                    const data = await usersRes.json();
                    const mappedUsers = data.map((u: any) => ({
                        ...u,
                        createdAt: u.created_at,
                        updatedAt: u.updated_at,
                        createdBy: u.created_by,
                        sigoProfiles: u.sigo_profiles,
                        linkedUnits: u.linked_units,
                        isActive: u.is_active
                    }));
                    setUsers(mappedUsers);
                }
                if (tipologiasRes.ok) {
                    const data = await tipologiasRes.json();
                    const mappedTipologias = data.map((t: any) => ({
                        ...t,
                        dataInclusao: t.data_inclusao,
                        criadoPor: t.criado_por
                    }));
                    setTipologias(mappedTipologias);
                }
                if (tipoLocaisRes.ok) {
                    const data = await tipoLocaisRes.json();
                    const mappedTipoLocais = data.map((t: any) => ({
                        ...t,
                        dataInclusao: t.data_inclusao,
                        criadoPor: t.criado_por
                    }));
                    setTipoLocais(mappedTipoLocais);
                }

                if (profilesRes.ok) {
                    const data = await profilesRes.json();
                    // Map to ensure compatibility if needed, currently API returns exact matches
                    setProfiles(data);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [isAuthenticated, currentUser, userPermissions, selectedProfile]);

    useEffect(() => {
        // This effect runs when requests or units change
        // Recalculate summary data based on filtered requests
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(req => req.status === 'Pendente').length;
        const approvedRequests = requests.filter(req => req.status === 'Aprovado').length;
        const rejectedRequests = requests.filter(req => req.status === 'Rejeitado').length;
        const inProgressRequests = requests.filter(req => req.status === 'Em Andamento').length;

        setSummaryData([
            { title: 'Total de Solicitações', count: totalRequests, value: totalRequests.toString(), icon: ListIcon, color: 'text-blue-500' },
            { title: 'Solicitações Pendentes', count: pendingRequests, value: pendingRequests.toString(), icon: ListIcon, color: 'text-yellow-500' },
            { title: 'Solicitações Aprovadas', count: approvedRequests, value: approvedRequests.toString(), icon: ListIcon, color: 'text-green-500' },
            { title: 'Solicitações Rejeitadas', count: rejectedRequests, value: rejectedRequests.toString(), icon: ListIcon, color: 'text-red-500' },
            { title: 'Solicitações Em Andamento', count: inProgressRequests, value: inProgressRequests.toString(), icon: ListIcon, color: 'text-purple-500' },
        ]);
    }, [requests, units]); // Depend on requests and units

    if (!isAuthenticated) {
        return <LoginScreen onLogin={(data) => {
            setIsAuthenticated(true);
            setCurrentUser(data.user);
            // Check for 'all' permission or specific list
            const perms = data.user.permissions || [];
            setUserPermissions(perms);

            // Set User's Profile
            if (data.profile?.name) {
                setSelectedProfile(data.profile.name);
            }
            // Optional: Redirect to first available view if current 'home' is not allowed?
            // For now, assuming 'home' is always allowed or handled in Sidebar
        }} />;
    }

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans">
            <Sidebar
                selectedProfile={selectedProfile}
                setSelectedProfile={setSelectedProfile}
                currentView={currentView}
                setCurrentView={setCurrentView}
                userPermissions={userPermissions} // Pass permissions
                userName={currentUser?.name || 'Usuário'} // Pass User Name
                availableProfiles={profiles.map(p => p.name)}
                onLogout={() => {
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                    setUserPermissions([]);
                    setCurrentView('home');
                }}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {currentView === 'home' && <HomeScreen setCurrentView={setCurrentView} />}
                {isSolicitacoesView && (
                    <>
                        <Header
                            title={solicitacoesTitle}
                            selectedProfile={selectedProfile}
                            setCurrentView={setCurrentView}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 my-6">
                            {summaryData.map((data, index) => (
                                <SummaryCard key={index} {...data} />
                            ))}
                        </div>
                        <RequestsTable
                            selectedProfile={selectedProfile}
                            currentView={currentView}
                            requests={requests}
                            setRequests={setRequests}
                            userName={currentUser?.name || 'Usuário'}
                        />
                    </>
                )}
                {currentView === 'aprovacao' && (
                    <ApprovalRequestsScreen
                        setCurrentView={setCurrentView}
                        requests={requests}
                        setRequests={setRequests}
                        selectedProfile={selectedProfile}
                        userName={currentUser?.name || 'Usuário'}
                    />
                )}
                {currentView === 'planejamento' && <PlanningScreen />}
                {currentView === 'plurianual' && <PlurianualScreen />}
                {currentView === 'tipologias' && <TipologiaScreen tipologias={tipologias} setTipologias={setTipologias} />}
                {currentView === 'cadastro_unidades' && <UnitsScreen units={units} setUnits={setUnits} />}
                {currentView === 'cadastro_tipo_local' && <TipoLocalScreen tipoLocais={tipoLocais} setTipoLocais={setTipoLocais} />}
                {currentView === 'access_registration' && (
                    <AccessRegistrationScreen
                        onBack={() => {
                            setEditingUser(null);
                            setCurrentView('gestao_acesso');
                        }}
                        units={units || []}
                        profiles={profiles || []}
                        registeredUsers={users || []}
                        initialUser={editingUser}
                        currentUser={currentUser}
                        currentProfile={selectedProfile}
                        onSuccess={(updatedUser, isNew) => {
                            setUsers(prev => {
                                if (isNew) {
                                    const exists = prev.some(u => u.nif === updatedUser.nif);
                                    if (exists) return prev.map(u => u.nif === updatedUser.nif ? updatedUser : u);
                                    return [updatedUser, ...prev];
                                } else {
                                    return prev.map(u => u.nif === updatedUser.nif ? updatedUser : u);
                                }
                            });
                            setEditingUser(null);
                            setCurrentView('gestao_acesso');
                        }}
                    />
                )}
                {currentView === 'gestao_acesso' && (
                    <AccessManagementScreen
                        units={units}
                        profiles={profiles}
                        registeredUsers={users}
                        setRegisteredUsers={setUsers}
                        userPermissions={userPermissions}
                        currentUser={currentUser}
                        selectedProfile={selectedProfile}
                        onNavigateToRegistration={() => {
                            setEditingUser(null);
                            setCurrentView('access_registration');
                        }}
                        onNavigateToEdit={(user) => {
                            setEditingUser(user);
                            setCurrentView('access_registration');
                        }}
                    />
                )}
                {currentView === 'perfil_acesso' && (
                    (userPermissions.includes('Configurações:Perfil Acesso') || userPermissions.includes('*') || userPermissions.includes('all')) ? (
                        <AccessProfileScreen profiles={profiles} setProfiles={setProfiles} userPermissions={userPermissions} currentUser={currentUser} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-red-500 font-bold text-xl">
                            Acesso Negado: Você não tem permissão para acessar esta tela.
                        </div>
                    )
                )}
                {currentView === 'politica_investimento' && <InvestmentPolicyScreen selectedProfile={selectedProfile} />}
                {currentView === 'nova_sede' && (
                    <OpenSedeRequestScreen
                        onClose={() => setCurrentView('solicitacoes')}
                        onSave={handleAddRequest}
                        userCategory={(currentUser?.linkedUnits?.length > 0 && currentUser?.instituicao) ? currentUser.instituicao : (profiles.find(p => p.name === selectedProfile)?.category || 'GERAL')}
                        currentUser={currentUser}
                        profiles={profiles}
                    />
                )}
                {currentView === 'nova_estrategica' && (
                    <OpenStrategicRequestScreen
                        onClose={() => setCurrentView('solicitacoes')}
                        onSave={handleAddRequest}
                        userCategory={(currentUser?.linkedUnits?.length > 0 && currentUser?.instituicao) ? currentUser.instituicao : (profiles.find(p => p.name === selectedProfile)?.category || 'GERAL')}
                        currentUser={currentUser}
                        profiles={profiles}
                    />
                )}
                {currentView === 'nova_unidade' && (
                    <OpenUnitRequestScreen
                        onClose={() => setCurrentView('solicitacoes')}
                        onSave={handleAddRequest}
                        units={units}
                        userCategory={(currentUser?.linkedUnits?.length > 0 && currentUser?.instituicao) ? currentUser.instituicao : (profiles.find(p => p.name === selectedProfile)?.category || 'GERAL')}
                        userLinkedUnits={currentUser?.linkedUnits || []}
                        currentUser={currentUser}
                        profiles={profiles}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
