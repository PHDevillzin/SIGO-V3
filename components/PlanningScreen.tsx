import React, { useState } from 'react';
import MonthlySummaryModal from './MonthlySummaryModal';
import AdvancedFilters from './AdvancedFilters';
import { MagnifyingGlassIcon, FilterIcon, ArrowsUpDownIcon, ArrowDownTrayIcon } from './Icons';
import EditRequestModal from './EditRequestModal';
import { Criticality, Request } from '../types';

const PlanningSummaryCard: React.FC<{ year: number, demand: number, value: string, onClick: () => void, isSelected: boolean }> = ({ year, demand, value, onClick, isSelected }) => (
    <div 
        onClick={onClick}
        className={`bg-white rounded-md shadow p-4 flex flex-col items-center justify-center text-center border border-gray-200 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
    >
        <p className="text-lg font-semibold text-gray-600">{year}</p>
        <p className="text-3xl font-bold text-gray-800 my-1">{demand}</p>
        <p className="text-sm text-gray-500">Demanda</p>
        <div className="bg-gray-100 text-center rounded p-2 mt-3 w-full">
            <p className="text-gray-700 font-semibold text-sm">{value}</p>
        </div>
    </div>
);


const PlanningScreen: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClassificationModalOpen, setIsClassificationModalOpen] = useState(false);

    const summaryData = [
        { year: 2026, demand: 28, value: 'R$ 15.000,00' },
        { year: 2027, demand: 35, value: 'R$ 21.000,00' },
        { year: 2028, demand: 42, value: 'R$ 17.000,00' },
        { year: 2029, demand: 28, value: 'R$ 7.000,00' },
        { year: 2030, demand: 15, value: 'R$ 5.000,00' },
    ];

    const dummyRequestForModal: Request = {
      id: 0, criticality: Criticality.MINIMA, unit: '', description: '', status: '',
      currentLocation: '', expectedStartDate: '', hasInfo: false, expectedValue: '', executingUnit: '',
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleCloseClassificationModal = () => {
        setIsClassificationModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Tela Planejamento</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {summaryData.map(data => (
                        <PlanningSummaryCard 
                            key={data.year} 
                            {...data} 
                            onClick={() => handleYearSelect(data.year)}
                            isSelected={selectedYear === data.year && isModalOpen}
                        />
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 flex justify-between items-center space-x-4">
                        <div className="relative flex-grow max-w-sm">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Procurar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                             <button
                                onClick={() => setIsClassificationModalOpen(true)}
                                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                            >
                                <ArrowsUpDownIcon className="w-5 h-5" />
                                <span>Classificar</span>
                            </button>
                             <button
                                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span>Exportar</span>
                            </button>
                            <button
                                onClick={() => setShowAdvancedFilters(prev => !prev)}
                                className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                            >
                                <FilterIcon className="w-5 h-5" />
                                <span>Filtros Avançados</span>
                            </button>
                        </div>
                    </div>
                    
                    {showAdvancedFilters && <AdvancedFilters hideSituacao hideTipologia />}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                    </th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Criticidade</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Ordem</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Unidade</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Descrição</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Situação</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Início Projeto</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Saldo Projeto Prazo</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Saldo Projeto Valor</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Início Obra</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Saldo Obra Prazo</th>
                                    <th scope="col" className="px-6 py-3 font-semibold">Saldo Obra Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                               {/* Table body is empty as per the image */}
                               <tr>
                                    <td colSpan={12} className="text-center py-10 text-gray-500">
                                        Nenhum dado disponível.
                                    </td>
                               </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <MonthlySummaryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                year={selectedYear}
            />
             <EditRequestModal
                isOpen={isClassificationModalOpen}
                onClose={handleCloseClassificationModal}
                request={dummyRequestForModal}
                onSave={handleCloseClassificationModal}
                title="Solicitação para classificação"
            />
        </>
    );
};

export default PlanningScreen;