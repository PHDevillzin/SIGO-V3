
import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, ListIcon, ChevronDoubleLeftIcon, ChevronDownIcon, LogoutIcon, BuildingOfficeIcon, Cog8ToothIcon, DocumentDuplicateIcon, WrenchScrewdriverIcon, TagIcon, FolderPlusIcon, Squares2x2Icon, ClipboardIcon, BuildingStorefrontIcon, CheckCircleIcon, UserIcon, CalendarDaysIcon, InformationCircleIcon, ExclamationTriangleIcon, SparklesIcon, CloudArrowUpIcon, ClipboardDocumentListIcon } from './Icons';

interface SidebarProps {
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  userPermissions: string[];
  userName: string;
  availableProfiles: string[];
  isApproverStrategic?: boolean;
  isApproverSede?: boolean;
  isRequesterStrategic?: boolean;
  isRequesterSede?: boolean;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; active?: boolean, onClick?: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="font-medium text-sm">{label}</span>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ selectedProfile, setSelectedProfile, currentView, setCurrentView, onLogout, userPermissions, userName, availableProfiles, isApproverStrategic, isApproverSede, isRequesterStrategic, isRequesterSede }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManagementMenuOpen, setIsManagementMenuOpen] = useState(false);
  const [isSolicitacoesMenuOpen, setIsSolicitacoesMenuOpen] = useState(false);
  const [isAbrirSolicitacoesMenuOpen, setIsAbrirSolicitacoesMenuOpen] = useState(false);
  const [isConfiguracoesMenuOpen, setIsConfiguracoesMenuOpen] = useState(false);

  // Helper to check permission
  const hasPermission = (permissionKey: string) => {
    // BLOCK: "Gestor (GSO)" cannot see Reclassification (Explicit Restriction)
    if (selectedProfile === 'Gestor (GSO)' && permissionKey === 'solicitacoes_reclassificacao') {
      return false;
    }

    // 1. Check for Admin wildcard
    if (userPermissions.includes('*') || userPermissions.includes('all')) return true;

    // Rules for 'Gestor Local' and 'Unidade Solicitante'
    const isRestrictedProfile = ['Gestor Local', 'Unidade Solicitante'].includes(selectedProfile);

    // Rule 1: Approval Screen
    // Grant access if explicit flags are set
    if (permissionKey === 'aprovacao') {
      if (isApproverStrategic || isApproverSede) return true;

      // If profile is Restricted (Gestor Local/Unidade Solicitante) and NOT an approver, deny access.
      if (isRestrictedProfile) return false;
    }

    // Rule 2: Open Request Screens 
    // Strict Granular Check for Requesters:
    // If ANY granular requester flag is present, we enforce strict mode for these specific screens.
    // This effectively overrides base profile permissions to prevent leakage (e.g., Sede appearing for Strategic-only users).
    const hasGranularRequesterFlags = isRequesterStrategic || isRequesterSede;

    if (hasGranularRequesterFlags) {
      if (permissionKey === 'nova_estrategica') return !!isRequesterStrategic;
      if (permissionKey === 'nova_sede') return !!isRequesterSede;
      // Proceed for other keys (like nova_unidade)
    } else {
      // Fallback: Default flags grant access if present (Universal Grant for non-strict cases or if logic changes)
      if (permissionKey === 'nova_estrategica' && isRequesterStrategic) return true;
      if (permissionKey === 'nova_sede' && isRequesterSede) return true;
    }

    if (isRestrictedProfile) {
      // If restricted and didn't match above (flags false or strict mode processed), deny.
      // Note: if hasGranularRequesterFlags was true, we already returned based on the flag value.
      // If we are here, either flags were false (strict denied) OR flags were absent.
      // If absent, we deny for restricted users.
      if (permissionKey === 'nova_estrategica' || permissionKey === 'nova_sede') return false;

      // For 'nova_unidade', restricted usually have access, but check flag?
      // Requirements didn't specify nova_unidade flag, so leave default or check isRequester?
      // Legacy: if (permissionKey === 'nova_unidade' && !isRequester) return false;
      // But we are moving away from isRequester? 
      // Let's assume nova_unidade relies on base permissions or 'isRequester' (if we still pass it).
      // For now, let's strictly handle the new flags.
      if (permissionKey === 'nova_unidade') return true;
    }

    // 2. Map Frontend Keys to Backend Permission Strings
    const permissionMap: Record<string, string[]> = {
      'home': ['Home'],

      // Menu Solicitações
      'solicitacoes': ['Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF)', 'Menu Solicitações:Gerais (PDF + Ciência)'],
      'solicitacoes_reclassificacao': ['Menu Solicitações:Reclassificação'],
      'aprovacao': ['Menu Solicitações:Aprovação'],
      'manutencao': ['Menu Solicitações:Manutenção'],
      'ciencia': ['Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF + Ciência)'], // Allow general access or specific science access

      // Abrir Solicitações
      'nova_estrategica': ['Abrir Solicitações:Estratégica'],
      'nova_sede': ['Abrir Solicitações:Sede'],
      'nova_unidade': ['Abrir Solicitações:Unidade'],

      // Gerenciamento
      'gerenciamento': ['Gerenciamento:Planejamento', 'Gerenciamento:Plurianual'], // Group check
      'planejamento': ['Gerenciamento:Planejamento'],
      'plurianual': ['Gerenciamento:Plurianual'],

      // Configurações
      'configuracoes': [
        'Configurações:Gestão de acesso',
        'Configurações:Unidades',
        'Configurações:Perfil Acesso',
        'Configurações:Arquivos',
        'Configurações:Criticidade',
        'Configurações:Gerenciamento de Avisos',
        'Configurações:Notificações',
        'Configurações:Periodo de solicitação',
        'Configurações:Tipolocal',
        'Configurações:Tipologia'
      ],
      'gestao_acesso': ['Configurações:Gestão de acesso'],
      'perfil_acesso': ['Configurações:Perfil Acesso'],
      'gerenciador_arquivos': ['Configurações:Arquivos'],
      'painel_criticidade': ['Configurações:Criticidade'],
      'avisos_globais': ['Configurações:Gerenciamento de Avisos'],
      'notificacoes_requisitos': ['Configurações:Notificações'],
      'cadastro_periodos': ['Configurações:Periodo de solicitação'],
      'cadastro_tipo_local': ['Configurações:Tipolocal'],
      'tipologias': ['Configurações:Tipologia'],
      'cadastro_unidades': ['Configurações:Unidades'],
    };

    // 3. Check if user has ANY of the required permissions for this key
    const requiredPermissions = permissionMap[permissionKey];

    // EXCEPTION: "Administrador GSO" always sees "Perfil Acesso"
    if (selectedProfile === 'Administrador GSO' && permissionKey === 'perfil_acesso') {
      return true;
    }

    if (requiredPermissions) {
      return requiredPermissions.some(p => userPermissions.includes(p));
    }

    // Fallback: check exact match just in case
    return userPermissions.includes(permissionKey);
  };


  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const isSolicitacoes = ['solicitacoes', 'solicitacoes_reclassificacao', 'aprovacao', 'manutencao', 'ciencia'].includes(currentView);
    const isGerenciamento = currentView === 'planejamento' || currentView === 'plurianual';
    const isAbrirSolicitacoes = ['nova_estrategica', 'nova_sede', 'nova_unidade'].includes(currentView);
    const isConfiguracoes = [
      'tipologias',
      'gestao_acesso',
      'perfil_acesso',
      'cadastro_unidades',
      'cadastro_periodos',
      'cadastro_tipo_local',
      'gerenciador_arquivos',
      'avisos_globais',
      'notificacoes_requisitos',
      'painel_criticidade'
    ].includes(currentView);

    setIsSolicitacoesMenuOpen(isSolicitacoes);
    setIsManagementMenuOpen(isGerenciamento);
    setIsAbrirSolicitacoesMenuOpen(isAbrirSolicitacoes);
    setIsConfiguracoesMenuOpen(isConfiguracoes);

  }, [currentView]);


  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0B1A4E] text-white overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-end">
          <span className="text-2xl font-bold tracking-wider">SESI</span>
          <span className="text-2xl font-bold tracking-wider text-red-600 bg-white px-1 ml-1">SENAI</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <ChevronDoubleLeftIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {hasPermission('home') && <NavItem icon={HomeIcon} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />}

        {/* Menu Solicitações Collapsible */}
        {(hasPermission('solicitacoes') || hasPermission('aprovacao')) && (
          <div>
            <button
              onClick={() => setIsSolicitacoesMenuOpen(prev => !prev)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${['solicitacoes', 'solicitacoes_reclassificacao', 'aprovacao', 'manutencao', 'ciencia'].includes(currentView) ? 'bg-white/10 text-white' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <ListIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Menu Solicitações</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSolicitacoesMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSolicitacoesMenuOpen && (
              <div className="pt-2 pl-6 space-y-2">
                {hasPermission('solicitacoes') && (
                  <NavItem
                    icon={ListIcon}
                    label="Solicitações gerais"
                    active={currentView === 'solicitacoes'}
                    onClick={() => setCurrentView('solicitacoes')}
                  />
                )}
                {hasPermission('ciencia') && (
                  <NavItem
                    icon={InformationCircleIcon}
                    label="Solicitações manifestação/ciência"
                    active={currentView === 'ciencia'}
                    onClick={() => setCurrentView('ciencia')}
                  />
                )}
                {hasPermission('solicitacoes_reclassificacao') && (
                  <NavItem
                    icon={DocumentDuplicateIcon}
                    label="Solicitações para reclassificação"
                    active={currentView === 'solicitacoes_reclassificacao'}
                    onClick={() => setCurrentView('solicitacoes_reclassificacao')}
                  />
                )}
                {hasPermission('aprovacao') && (
                  <NavItem
                    icon={CheckCircleIcon}
                    label="Solicitações para aprovação"
                    active={currentView === 'aprovacao'}
                    onClick={() => setCurrentView('aprovacao')}
                  />
                )}
                {hasPermission('manutencao') && (
                  <NavItem
                    icon={WrenchScrewdriverIcon}
                    label="Manutenção"
                    active={currentView === 'manutencao'}
                    onClick={() => setCurrentView('manutencao')}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Abrir Solicitações Collapsible Menu */}
        {(hasPermission('nova_estrategica') || hasPermission('nova_sede') || hasPermission('nova_unidade')) && (
          <div>
            <button
              onClick={() => setIsAbrirSolicitacoesMenuOpen(prev => !prev)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${['nova_estrategica', 'nova_sede', 'nova_unidade'].includes(currentView) ? 'bg-white/10 text-white' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <FolderPlusIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Abrir Solicitações</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAbrirSolicitacoesMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAbrirSolicitacoesMenuOpen && (
              <div className="pt-2 pl-6 space-y-2">
                {hasPermission('nova_estrategica') && (
                  <NavItem
                    icon={Squares2x2Icon}
                    label="Abrir Estratégica"
                    active={currentView === 'nova_estrategica'}
                    onClick={() => setCurrentView('nova_estrategica')}
                  />
                )}
                {hasPermission('nova_sede') && (
                  <NavItem
                    icon={ClipboardIcon}
                    label="Abrir Sede"
                    active={currentView === 'nova_sede'}
                    onClick={() => setCurrentView('nova_sede')}
                  />
                )}
                {hasPermission('nova_unidade') && (
                  <NavItem
                    icon={BuildingStorefrontIcon}
                    label="Abrir Unidade"
                    active={currentView === 'nova_unidade'}
                    onClick={() => setCurrentView('nova_unidade')}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Gerenciamento Collapsible Menu */}
        {hasPermission('gerenciamento') && (
          <div>
            <button
              onClick={() => setIsManagementMenuOpen(prev => !prev)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${(currentView === 'planejamento' || currentView === 'plurianual') ? 'bg-white/10 text-white' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <ClipboardDocumentListIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Gerenciamento</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isManagementMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isManagementMenuOpen && (
              <div className="pt-2 pl-6 space-y-2">
                <NavItem
                  icon={BuildingOfficeIcon}
                  label="Planejamento"
                  active={currentView === 'planejamento'}
                  onClick={() => setCurrentView('planejamento')}
                />
                <NavItem
                  icon={DocumentDuplicateIcon}
                  label="Plurianual"
                  active={currentView === 'plurianual'}
                  onClick={() => setCurrentView('plurianual')}
                />
              </div>
            )}
          </div>
        )}

        {/* Configurações Collapsible Menu */}
        {hasPermission('configuracoes') && (
          <div>
            <button
              onClick={() => setIsConfiguracoesMenuOpen(prev => !prev)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${[
                'tipologias',
                'gestao_acesso',
                'perfil_acesso',
                'cadastro_unidades',
                'cadastro_periodos',
                'cadastro_tipo_local',
                'gerenciador_arquivos',
                'avisos_globais',
                'notificacoes_requisitos',
                'painel_criticidade'
              ].includes(currentView) ? 'bg-white/10 text-white' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Cog8ToothIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Configurações</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isConfiguracoesMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isConfiguracoesMenuOpen && (
              <div className="pt-2 pl-6 space-y-2">
                {hasPermission('gestao_acesso') && (
                  <NavItem
                    icon={UserIcon}
                    label="Gestão acesso"
                    active={currentView === 'gestao_acesso'}
                    onClick={() => setCurrentView('gestao_acesso')}
                  />
                )}
                {hasPermission('perfil_acesso') && (
                  <NavItem
                    icon={UserIcon}
                    label="Perfil acesso"
                    active={currentView === 'perfil_acesso'}
                    onClick={() => setCurrentView('perfil_acesso')}
                  />
                )}
                {hasPermission('gerenciador_arquivos') && (
                  <NavItem
                    icon={CloudArrowUpIcon}
                    label="Arquivos"
                    active={currentView === 'gerenciador_arquivos'}
                    onClick={() => setCurrentView('gerenciador_arquivos')}
                  />
                )}
                {hasPermission('painel_criticidade') && (
                  <NavItem
                    icon={SparklesIcon}
                    label="Criticidade"
                    active={currentView === 'painel_criticidade'}
                    onClick={() => setCurrentView('painel_criticidade')}
                  />
                )}
                {hasPermission('avisos_globais') && (
                  <NavItem
                    icon={InformationCircleIcon}
                    label="Gerenciamento de avisos"
                    active={currentView === 'avisos_globais'}
                    onClick={() => setCurrentView('avisos_globais')}
                  />
                )}
                {hasPermission('notificacoes_requisitos') && (
                  <NavItem
                    icon={ExclamationTriangleIcon}
                    label="Notificações e requisitos"
                    active={currentView === 'notificacoes_requisitos'}
                    onClick={() => setCurrentView('notificacoes_requisitos')}
                  />
                )}
                {hasPermission('cadastro_periodos') && (
                  <NavItem
                    icon={CalendarDaysIcon}
                    label="Período Solicitação"
                    active={currentView === 'cadastro_periodos'}
                    onClick={() => setCurrentView('cadastro_periodos')}
                  />
                )}
                {hasPermission('cadastro_tipo_local') && (
                  <NavItem
                    icon={TagIcon}
                    label="Tipo local"
                    active={currentView === 'cadastro_tipo_local'}
                    onClick={() => setCurrentView('cadastro_tipo_local')}
                  />
                )}
                {hasPermission('tipologias') && (
                  <NavItem
                    icon={TagIcon}
                    label="Tipologia"
                    active={currentView === 'tipologias'}
                    onClick={() => setCurrentView('tipologias')}
                  />
                )}
                {hasPermission('cadastro_unidades') && (
                  <NavItem
                    icon={BuildingOfficeIcon}
                    label="Unidades"
                    active={currentView === 'cadastro_unidades'}
                    onClick={() => setCurrentView('cadastro_unidades')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src="https://i.pravatar.cc/100?u=paulo"
            alt={userName}
          />
          <div>
            <p className="font-semibold text-white">{userName}</p>
          </div>
        </div>
        <div className="relative mb-4" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="w-full bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-3 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span className="truncate">{selectedProfile}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 bottom-full mb-1 w-full bg-white rounded-md shadow-lg" role="listbox">
              <ul className="py-1 max-h-60 overflow-auto text-gray-900">
                {availableProfiles.map((profile) => (
                  <li
                    key={profile}
                    onClick={() => {
                      setSelectedProfile(profile);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center relative ${profile === selectedProfile ? 'bg-gray-300' : ''}`}
                    role="option"
                    aria-selected={profile === selectedProfile}
                  >
                    <span>{profile}</span>
                    {profile === selectedProfile && (
                      <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 bg-[#E53A68] text-white font-bold py-2.5 px-4 rounded-md hover:bg-opacity-90 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
