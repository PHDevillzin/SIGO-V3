
import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, ListIcon, ChevronDoubleLeftIcon, ChevronDownIcon, LogoutIcon, BuildingOfficeIcon, Cog8ToothIcon, DocumentDuplicateIcon, WrenchScrewdriverIcon, TagIcon } from './Icons';

interface SidebarProps {
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; active?: boolean, onClick?: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ selectedProfile, setSelectedProfile, currentView, setCurrentView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManagementMenuOpen, setIsManagementMenuOpen] = useState(false);
  const [isSolicitacoesMenuOpen, setIsSolicitacoesMenuOpen] = useState(false);

  const profiles = [
    "Administração do Sistema",
    "Alta Administração Senai",
    "Solicitação Unidade",
    "Gestor GSO",
    "Diretoria Corporativa",
    "Gerência de Infraestrutura e Suprimento",
    "Gestor Local",
    "Gerência de Infraestrutura e Suprimento - Aprovador",
    "Gerência Sênior de Tecnologia da Informação",
    "Gerência Sênior de Tecnologia da Informação - Aprovador",
    "Gerência de Saúde e Segurança",
    "Gerência de Educação",
    "Gerência de Educação - Aprovador"
  ];
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
  
  const userName = "Paulo Ribeiro";
  useEffect(() => {
      setSelectedProfile("Solicitação Unidade");
  }, [setSelectedProfile]);

  useEffect(() => {
    const isSolicitacoes = ['solicitacoes', 'solicitacoes_reclassificacao', 'manutencao'].includes(currentView);
    const isGerenciamento = currentView === 'planejamento' || currentView === 'plurianual';
    
    setIsSolicitacoesMenuOpen(isSolicitacoes);
    setIsManagementMenuOpen(isGerenciamento);

  }, [currentView]);


  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0B1A4E] text-white">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-end">
            <span className="text-2xl font-bold tracking-wider">SESI</span>
            <span className="text-2xl font-bold tracking-wider text-red-600 bg-white px-1 ml-1">SENAI</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <ChevronDoubleLeftIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem icon={HomeIcon} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        
        {/* Menu Solicitações Collapsible */}
        <div>
          <button
            onClick={() => setIsSolicitacoesMenuOpen(prev => !prev)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${['solicitacoes', 'solicitacoes_reclassificacao', 'manutencao'].includes(currentView) ? 'bg-white/10 text-white' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <ListIcon className="w-5 h-5" />
              <span className="font-medium">Menu Solicitações</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSolicitacoesMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSolicitacoesMenuOpen && (
            <div className="pt-2 pl-6 space-y-2">
              <NavItem 
                icon={ListIcon}
                label="Solicitações gerais"
                active={currentView === 'solicitacoes'}
                onClick={() => setCurrentView('solicitacoes')}
              />
               <NavItem 
                icon={DocumentDuplicateIcon}
                label="Solicitações para reclassificação"
                active={currentView === 'solicitacoes_reclassificacao'}
                onClick={() => setCurrentView('solicitacoes_reclassificacao')}
              />
               <NavItem 
                icon={WrenchScrewdriverIcon}
                label="Manutenção"
                active={currentView === 'manutencao'}
                onClick={() => setCurrentView('manutencao')}
              />
            </div>
          )}
        </div>

        <NavItem icon={TagIcon} label="Tipologia" active={currentView === 'tipologias'} onClick={() => setCurrentView('tipologias')} />

        {/* Gerenciamento Collapsible Menu */}
        <div>
          <button
            onClick={() => setIsManagementMenuOpen(prev => !prev)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-white/5 ${(currentView === 'planejamento' || currentView === 'plurianual') ? 'bg-white/10 text-white' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <Cog8ToothIcon className="w-5 h-5" />
              <span className="font-medium">Gerenciamento</span>
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
      </nav>
      <div className="p-4 border-t border-white/10">
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
            <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 bottom-full mb-1 w-full bg-white rounded-md shadow-lg" role="listbox">
              <ul className="py-1 max-h-60 overflow-auto text-gray-900">
                {profiles.map((profile) => (
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
        <button className="w-full flex items-center justify-center space-x-2 bg-[#E53A68] text-white font-bold py-2.5 px-4 rounded-md hover:bg-opacity-90 transition-colors">
          <LogoutIcon className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
