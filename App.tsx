import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import RequestsTable from './components/RequestsTable';
import { ListIcon, CalculatorIcon } from './components/Icons';

import type { SummaryData } from './types';


const App: React.FC = () => {
    const [selectedProfile, setSelectedProfile] = useState('Gestor GSO');
    
    const summaryData: SummaryData[] = [
        { title: 'Nova Unidade', count: 3, value: 'R$ 130.500.000,00', color: 'border-green-500', icon: ListIcon },
        { title: 'Reforma Estratégica', count: 1, value: 'R$ 5.000.000,00', color: 'border-purple-500', icon: ListIcon },
        { title: 'Reforma Operacional', count: 13, value: 'R$ 18.365.000,00', color: 'border-blue-400', icon: ListIcon },
        { title: 'Baixa Complexidade', count: 3, value: 'R$ 1.025.000,00', color: 'border-sky-400', icon: ListIcon },
        { title: 'Total Geral', count: 20, value: 'R$ 154.890.000,00', color: 'border-orange-400', icon: CalculatorIcon },
    ];

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans">
      <Sidebar selectedProfile={selectedProfile} setSelectedProfile={setSelectedProfile} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Header title="Solicitações" selectedProfile={selectedProfile} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 my-6">
          {summaryData.map((data, index) => (
            <SummaryCard key={index} {...data} />
          ))}
        </div>
        <RequestsTable selectedProfile={selectedProfile} />
      </main>
    </div>
  );
};

export default App;