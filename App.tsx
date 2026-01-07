
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
import AccessProfileScreen from './components/AccessProfileScreen';
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
    
    // ... (rest of state)

    // ... (fetchData useEffect)

    if (!isAuthenticated) {
        return <LoginScreen onLogin={(data) => {
            setIsAuthenticated(true);
            setCurrentUser(data.user);
            // Check for 'all' permission or specific list
            const perms = data.user.permissions || [];
            setUserPermissions(perms);
            
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
                onLogout={() => {
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                    setUserPermissions([]);
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
            />
          </>
        )}
        {currentView === 'planejamento' && <PlanningScreen />}
        {currentView === 'plurianual' && <PlurianualScreen />}
        {currentView === 'tipologias' && <TipologiaScreen tipologias={tipologias} setTipologias={setTipologias} />}
        {currentView === 'cadastro_unidades' && <UnitsScreen units={units} setUnits={setUnits} />}
        {currentView === 'cadastro_tipo_local' && <TipoLocalScreen tipoLocais={tipoLocais} setTipoLocais={setTipoLocais} />}
        {currentView === 'gestao_acesso' && <AccessManagementScreen units={units} profiles={profiles} registeredUsers={users} setRegisteredUsers={setUsers} />}
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
