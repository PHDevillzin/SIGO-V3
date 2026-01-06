
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import RequestsTable, { initialRequests } from './components/RequestsTable';
import PlanningScreen from './components/PlanningScreen';
import PlurianualScreen from './components/PlurianualScreen';
import HomeScreen from './components/HomeScreen';
import TipologiaScreen from './components/TipologiaScreen';
import UnitsScreen, { initialUnits } from './components/UnitsScreen';
import TipoLocalScreen from './components/TipoLocalScreen';
import AccessManagementScreen from './components/AccessManagementScreen';
import AccessProfileScreen from './components/AccessProfileScreen';
import OpenSedeRequestScreen from './components/OpenSedeRequestScreen';
import OpenStrategicRequestScreen from './components/OpenStrategicRequestScreen';
import OpenUnitRequestScreen from './components/OpenUnitRequestScreen';
import InvestmentPolicyScreen from './components/InvestmentPolicyScreen';
import { ListIcon, CalculatorIcon } from './components/Icons';

import type { SummaryData, Request, Unit, AccessProfile } from './types';

const INITIAL_PROFILES: AccessProfile[] = [
    { id: '1', name: 'Administração do Sistema', permissions: ['all'] },
    { id: '2', name: 'Alta Administração Senai', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '3', name: 'Solicitação Unidade', permissions: ['home', 'solicitacoes', 'nova_unidade'] },
    { id: '4', name: 'Gestor GSO', permissions: ['home', 'solicitacoes'] },
    { id: '5', name: 'Diretoria Corporativa', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '6', name: 'Gerência de Infraestrutura e Suprimento', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '7', name: 'Gestor Local', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '8', name: 'Gerência de Infraestrutura e Suprimento - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '9', name: 'Gerência Sênior de Tecnologia da Informação', permissions: ['home', 'solicitacoes', 'nova_sede'] },
    { id: '10', name: 'Gerência Sênior de Tecnologia da Informação - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '11', name: 'Gerência de Saúde e Segurança', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '12', name: 'Gerência de Educação', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '13', name: 'Gerência de Educação - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
];

const App: React.FC = () => {
    const [selectedProfile, setSelectedProfile] = useState('Gestor GSO');
    const [currentView, setCurrentView] = useState('home');
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [units, setUnits] = useState<Unit[]>(initialUnits);
    const [profiles, setProfiles] = useState<AccessProfile[]>(INITIAL_PROFILES);

    useEffect(() => {
        // Fetch Profiles
        fetch('/api/profiles')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setProfiles(data);
            })
            .catch(err => console.error('Failed to fetch profiles', err));

        // Fetch Units
        fetch('/api/units')
            .then(res => res.json())
            .then(data => {
                 if (Array.isArray(data) && data.length > 0) setUnits(data);
            })
            .catch(err => console.error('Failed to fetch units', err));

        // Fetch Requests
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => {
                 if (Array.isArray(data) && data.length > 0) setRequests(data);
            })
            .catch(err => console.error('Failed to fetch requests', err));
    }, []);
    
    const summaryData: SummaryData[] = [
        { title: 'Nova Unidade', count: 3, value: 'R$ 130.500.000,00', color: 'border-green-500', icon: ListIcon },
        { title: 'Reforma Estratégica', count: 1, value: 'R$ 5.000.000,00', color: 'border-purple-500', icon: ListIcon },
        { title: 'Reforma Operacional', count: 13, value: 'R$ 18.365.000,00', color: 'border-blue-400', icon: ListIcon },
        { title: 'Baixa Complexidade', count: 3, value: 'R$ 1.025.000,00', color: 'border-sky-400', icon: ListIcon },
        { title: 'Total Geral', count: 20, value: 'R$ 154.890.000,00', color: 'border-orange-400', icon: CalculatorIcon },
    ];

    const isSolicitacoesView = ['solicitacoes', 'solicitacoes_reclassificacao', 'aprovacao', 'manutencao'].includes(currentView);
    const getSolicitacoesTitle = () => {
        switch (currentView) {
            case 'solicitacoes':
                return 'Solicitações';
            case 'solicitacoes_reclassificacao':
                return 'Solicitações para Reclassificação';
            case 'aprovacao':
                return 'Solicitações para Aprovação';
            case 'manutencao':
                return 'Manutenção';
            default:
                return 'Solicitações';
        }
    };
    const solicitacoesTitle = getSolicitacoesTitle();

    const handleAddRequest = (newRequest: Request) => {
        setRequests(prev => [newRequest, ...prev]);
        setCurrentView('solicitacoes');
    };


  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans">
      <Sidebar 
        selectedProfile={selectedProfile} 
        setSelectedProfile={setSelectedProfile}
        currentView={currentView}
        setCurrentView={setCurrentView}
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
            />
          </>
        )}
        {currentView === 'planejamento' && <PlanningScreen />}
        {currentView === 'plurianual' && <PlurianualScreen />}
        {currentView === 'tipologias' && <TipologiaScreen />}
        {currentView === 'cadastro_unidades' && <UnitsScreen units={units} setUnits={setUnits} />}
        {currentView === 'cadastro_tipo_local' && <TipoLocalScreen />}
        {currentView === 'gestao_acesso' && <AccessManagementScreen units={units} profiles={profiles} />}
        {currentView === 'perfil_acesso' && <AccessProfileScreen profiles={profiles} setProfiles={setProfiles} />}
        {currentView === 'politica_investimento' && <InvestmentPolicyScreen selectedProfile={selectedProfile} />}
        {currentView === 'nova_sede' && <OpenSedeRequestScreen onClose={() => setCurrentView('solicitacoes')} onSave={handleAddRequest} />}
        {currentView === 'nova_estrategica' && <OpenStrategicRequestScreen onClose={() => setCurrentView('solicitacoes')} onSave={handleAddRequest} />}
        {currentView === 'nova_unidade' && <OpenUnitRequestScreen onClose={() => setCurrentView('solicitacoes')} onSave={handleAddRequest} />}
      </main>
    </div>
  );
};

export default App;
