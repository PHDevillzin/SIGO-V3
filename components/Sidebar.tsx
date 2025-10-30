import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, ListIcon, ChevronDoubleLeftIcon, ChevronDownIcon, LogoutIcon } from './Icons';

const NavItem: React.FC<{ icon: React.ElementType; label: string; active?: boolean }> = ({ icon: Icon, label, active = false }) => (
  <a href="#" className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </a>
);

const Sidebar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('Gestor GSO');
  const profiles = [
    "Administração do Sistema",
    "Alta Administração Senai",
    "Solicitação Unidade",
    "Gestor GSO",
    "Diretoria Corporativa",
    "Planejamento"
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
        <NavItem icon={HomeIcon} label="Home" />
        <NavItem icon={ListIcon} label="Solicitações Gerais" active={true} />
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src="https://picsum.photos/id/237/100/100"
            alt="Paulo Henrique"
          />
          <div>
            <p className="font-semibold text-white">Paulo Henrique</p>
          </div>
        </div>
        <div className="relative mb-4" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="w-full bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-3 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span>{selectedProfile}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg" role="listbox">
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
