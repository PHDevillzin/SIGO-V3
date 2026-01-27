
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
import { ListIcon, CalculatorIcon } from './components/Icons';
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
                        codigoUnidade: u.codigoUnidade || u.codigo_unidade,
                        responsavelRE: u.responsavelRE || u.responsavel_re,
                        responsavelRA: u.responsavelRA || u.responsavel_ra,
                        responsavelRAR: u.responsavelRAR || u.responsavel_rar,
                        tipoDeUnidade: u.tipoDeUnidade || u.tipo_de_unidade,
                        unidadeResumida: u.unidadeResumida || u.unidade_resumida,
                        gerenteRegional: u.gerenteRegional || u.gerente_regional,
                        emailGR: u.emailGR || u.email_gr
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
                        // API now returns camelCase, so we don't need to remap snake_case
                        // unless we need specific transformations.
                        // Ensuring Date strings are handled if needed, but for now passing through.
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
                        isActive: u.is_active,
                        isApprover: u.is_approver,
                        isRequester: u.is_requester,
                        isApproverStrategic: u.isApproverStrategic || u.is_approver_strategic,
                        isApproverSede: u.isApproverSede || u.is_approver_sede,
                        isRequesterStrategic: u.isRequesterStrategic || u.is_requester_strategic,
                        isRequesterSede: u.isRequesterSede || u.is_requester_sede
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

    // Helper to parse currency strings like "3,5 mi", "300 mil", "R$ 3.500.000,00"
    const parseCurrency = (str: string) => {
        if (!str) return 0;
        let cleanStr = str.replace('R$', '').trim();
        let multiplier = 1;

        if (cleanStr.toLowerCase().includes('mi')) {
            multiplier = 1000000;
            cleanStr = cleanStr.toLowerCase().replace('mi', '').replace('l', '').trim(); // Handle 'mil' vs 'mi' overlap if needed, but 'mi' is 1M
            // Actually 'mil' contains 'mi'?? No. 'm' 'i' 'l'. 'm' 'i'.
            // If it has 'mil', it has 'mi' inside? Yes.
            // Strict check:
            if (str.toLowerCase().endsWith('mil') || str.toLowerCase().includes(' mil')) {
                multiplier = 1000;
                cleanStr = cleanStr.toLowerCase().replace('mil', '').trim();
            } else {
                 multiplier = 1000000;
                 cleanStr = cleanStr.toLowerCase().replace('mi', '').trim();
            }
        } else if (cleanStr.toLowerCase().includes('mil')) {
             multiplier = 1000;
             cleanStr = cleanStr.toLowerCase().replace('mil', '').trim();
        }

        // Handle separators
        if (cleanStr.includes('.') && cleanStr.includes(',')) {
             cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
        } else if (cleanStr.includes(',')) {
            // Assume comma is decimal if no dots present, OR comma is decimal (Brazilian standard)
            cleanStr = cleanStr.replace(',', '.');
        }
        
        const val = parseFloat(cleanStr);
        return isNaN(val) ? 0 : val * multiplier;
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const getColorForCategory = (cat: string) => {
        const lower = cat.toLowerCase();
        if (lower.includes('nova unidade') || lower.includes('expansão')) return 'border-green-500';
        if (lower.includes('estratégica')) return 'border-purple-500';
        if (lower.includes('reforma') || lower.includes('modernização')) return 'border-blue-500';
        if (lower.includes('baixa complexidade')) return 'border-sky-500';
        if (lower.includes('manutenção')) return 'border-indigo-500';
        return 'border-gray-500';
    };

    useEffect(() => {
        if (requests.length === 0) {
            setSummaryData([]);
            return;
        }

        const categoryMap = new Map<string, { count: number; value: number }>();

        requests.forEach(req => {
            const cat = req.categoriaInvestimento || 'Outros';
            const val = parseCurrency(req.expectedValue);
            
            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, { count: 0, value: 0 });
            }
            const current = categoryMap.get(cat)!;
            current.count += 1;
            current.value += val;
        });

        // Specific order based on image if possible, or alphabetical
        // Image: Nova Unidade, Intervenção, Reforma, Baixa, Manutenção
        // We will sort to try and match this hierarchy: 
        // 1. Nova Unidade/Expansão
        // 2. Intervenção Estratégica
        // 3. Reforma Operacional / Modernização
        // 4. Baixa Complexidade
        // 5. Manutenção
        // 6. Outros
        
        const sortOrder = [
            'Nova Unidade', 'Expansão',
            'Intervenção Estratégica',
            'Reforma Operacional', 'Modernização',
            'Baixa Complexidade', 
            'Manutenção', 'Manutenção Corretiva'
        ];

        const sortedCategories = Array.from(categoryMap.keys()).sort((a, b) => {
             const idxA = sortOrder.indexOf(a);
             const idxB = sortOrder.indexOf(b);
             // If both found, sort by index
             if (idxA !== -1 && idxB !== -1) return idxA - idxB;
             // If only A found, A comes first
             if (idxA !== -1) return -1;
             // If only B found, B comes first
             if (idxB !== -1) return 1;
             // Alphabetical otherwise
             return a.localeCompare(b);
        });

        const newSummary: SummaryData[] = sortedCategories.map(cat => {
            const data = categoryMap.get(cat)!;
            return {
                title: cat,
                count: data.count,
                value: formatCurrency(data.value),
                icon: ListIcon,
                color: getColorForCategory(cat)
            };
        });

        // Add Total Geral
        const totalCount = requests.length;
        const totalValue = requests.reduce((acc, r) => acc + parseCurrency(r.expectedValue), 0);
        
        newSummary.push({
            title: 'Total Geral',
            count: totalCount,
            value: formatCurrency(totalValue),
            icon: CalculatorIcon, // Ensure CalculatorIcon is imported
            color: 'border-orange-500' // Distinct color
        });

        setSummaryData(newSummary);

    }, [requests, units]);

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
                isApproverStrategic={currentUser?.isApproverStrategic || currentUser?.is_approver_strategic}
                isApproverSede={currentUser?.isApproverSede || currentUser?.is_approver_sede}
                isRequesterStrategic={currentUser?.isRequesterStrategic || currentUser?.is_requester_strategic}
                isRequesterSede={currentUser?.isRequesterSede || currentUser?.is_requester_sede}
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
                        isApproverStrategic={currentUser?.isApproverStrategic || currentUser?.is_approver_strategic}
                        isApproverSede={currentUser?.isApproverSede || currentUser?.is_approver_sede}
                    />
                )}
                {currentView === 'planejamento' && <PlanningScreen />}
                {currentView === 'plurianual' && <PlurianualScreen />}
                {currentView === 'tipologias' && <TipologiaScreen tipologias={tipologias} setTipologias={setTipologias} />}
                {currentView === 'cadastro_unidades' && <UnitsScreen units={units} setUnits={setUnits} />}
                {currentView === 'cadastro_tipo_local' && <TipoLocalScreen tipoLocais={tipoLocais} setTipoLocais={setTipoLocais} />}
                {currentView === 'access_registration' && (
                    <AccessRegistrationScreen
                        units={units || []}
                        profiles={profiles || []}
                        registeredUsers={users || []}
                        initialUser={editingUser}
                        currentUser={currentUser}
                        currentProfile={selectedProfile}
                        onBack={() => {
                            setEditingUser(null);
                            setCurrentView('gestao_acesso');
                        }}
                        onSuccess={(updatedResult, isEditing) => {
                            setUsers(prev => {
                                const updates = Array.isArray(updatedResult) ? updatedResult : [updatedResult];
                                let newList = [...prev];
                                
                                updates.forEach(updatedUser => {
                                    const existsIndex = newList.findIndex(u => u.nif === updatedUser.nif);
                                    if (existsIndex >= 0) {
                                        // Update existing
                                        newList[existsIndex] = updatedUser;
                                    } else {
                                        // Add new
                                        newList = [updatedUser, ...newList]; 
                                    }
                                });
                                return newList;
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
                    (userPermissions.includes('Configurações:Perfil Acesso') || userPermissions.includes('*') || userPermissions.includes('all') || selectedProfile === 'Administrador GSO') ? (
                        <AccessProfileScreen 
                            profiles={profiles} 
                            setProfiles={setProfiles} 
                            userPermissions={userPermissions} 
                            currentUser={currentUser}
                            currentProfileName={selectedProfile}
                        />
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
                        units={units}
                        userLinkedUnits={currentUser?.linkedUnits || []}
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
