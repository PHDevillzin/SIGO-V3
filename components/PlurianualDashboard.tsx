
import React, { useState } from 'react';
import { MultiSelectDropdown } from './AdvancedFilters';
import { MagnifyingGlassIcon, FilterIcon } from './Icons';

interface PlurianualDashboardProps {
    setCurrentView: (view: string) => void;
}

const PlurianualDashboard: React.FC<PlurianualDashboardProps> = ({ setCurrentView }) => {
    // Mock Data for the table
    const tableData = [
        { year: 2023, v2025: 92585016.53, v2026: 30231076.44, v2027: 0, v2028: 0, v2029: 0, v2030: 0, saldo: 122816092.97 },
        { year: 2024, v2025: 139338297.55, v2026: 22510822.99, v2027: 12085836.54, v2028: 0, v2029: 0, v2030: 0, saldo: 173934957.07 },
        { year: 2025, v2025: 114922908.07, v2026: 441161744.38, v2027: 180019403.54, v2028: 23467091.48, v2029: 0, v2030: 0, saldo: 759571147.46 },
        { year: 2026, v2025: 0, v2026: 189033600.37, v2027: 385824155.89, v2028: 166362589.98, v2029: 37197799.50, v2030: 0, saldo: 778418145.75 },
        { year: 2027, v2025: 0, v2026: 0, v2027: 25346241.94, v2028: 100649108.55, v2029: 64367046.45, v2030: 0, saldo: 190362396.94 },
        { year: 2028, v2025: 0, v2026: 0, v2027: 0, v2028: 76880023.07, v2029: 75524976.93, v2030: 0, saldo: 152404999.99 },
        { year: 2029, v2025: 0, v2026: 0, v2027: 0, v2028: 0, v2029: 25441556.45, v2030: 24842082.69, saldo: 50283639.14 },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value);
    };

    // Calculate totals
    const totals = tableData.reduce((acc, row) => ({
        v2025: acc.v2025 + row.v2025,
        v2026: acc.v2026 + row.v2026,
        v2027: acc.v2027 + row.v2027,
        v2028: acc.v2028 + row.v2028,
        v2029: acc.v2029 + row.v2029,
        v2030: acc.v2030 + row.v2030,
        saldo: acc.saldo + row.saldo,
    }), { v2025: 0, v2026: 0, v2027: 0, v2028: 0, v2029: 0, v2030: 0, saldo: 0 });

    // Filter States
    const [entidade, setEntidade] = useState<string[]>([]);
    const [analise, setAnalise] = useState<string[]>([]);
    const [investimento, setInvestimento] = useState<string[]>([]);
    const [portfolio, setPortfolio] = useState<string[]>([]);
    const [tipologia, setTipologia] = useState<string[]>([]);
    const [cidadeBairro, setCidadeBairro] = useState<string[]>([]);
    const [unidade, setUnidade] = useState<string[]>([]);
    const [despesa, setDespesa] = useState<string[]>([]);

    // Toggle State
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClearFilters = () => {
        setEntidade([]);
        setAnalise([]);
        setInvestimento([]);
        setPortfolio([]);
        setTipologia([]);
        setCidadeBairro([]);
        setUnidade([]);
        setDespesa([]);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setCurrentView('plurianual')} className="text-gray-500 hover:text-gray-700">
                        {/* Back Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">Plano Plurianual de Obras</h1>
                </div>
                <div className="text-sm text-gray-500 text-right">
                    <p>Atualizado em: 12/12/25</p>
                </div>
            </div>

            {/* Toolbar: Search and Filters Toggle */}
            <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div className="relative w-1/3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Procurar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                >
                    <FilterIcon className="w-5 h-5" />
                    <span>Filtros Avançados</span>
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="bg-white rounded-lg shadow p-4 border-t border-gray-100">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-xs font-semibold"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MultiSelectDropdown label="Entidade" options={['SESI', 'SENAI']} selectedValues={entidade} onChange={setEntidade} placeholder="Todos" />
                        <MultiSelectDropdown label="Análise" options={['Opção 1', 'Opção 2']} selectedValues={analise} onChange={setAnalise} placeholder="Todos" />
                        <MultiSelectDropdown label="Investimento" options={['Opção 1', 'Opção 2']} selectedValues={investimento} onChange={setInvestimento} placeholder="Todos" />
                        <MultiSelectDropdown label="Portfólio" options={['Opção 1', 'Opção 2']} selectedValues={portfolio} onChange={setPortfolio} placeholder="Todos" />
                        <MultiSelectDropdown label="Tipologia" options={['Tipologia A', 'Tipologia B']} selectedValues={tipologia} onChange={setTipologia} placeholder="Todos" />
                        <MultiSelectDropdown label="Cidade / Bairro" options={['São Paulo', 'Campinas']} selectedValues={cidadeBairro} onChange={setCidadeBairro} placeholder="Todos" />
                        <MultiSelectDropdown label="Unidade" options={['Unidade X', 'Unidade Y']} selectedValues={unidade} onChange={setUnidade} placeholder="Todos" />
                        <MultiSelectDropdown label="Despesa" options={['CAPEX', 'OPEX']} selectedValues={despesa} onChange={setDespesa} placeholder="Todos" />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Previsão de Empenho por Ano de Homologação</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="py-3 px-4 text-left">Ano de Homologação</th>
                                <th className="py-3 px-4 text-right">2025</th>
                                <th className="py-3 px-4 text-right">2026</th>
                                <th className="py-3 px-4 text-right">2027</th>
                                <th className="py-3 px-4 text-right">2028</th>
                                <th className="py-3 px-4 text-right">2029</th>
                                <th className="py-3 px-4 text-right">2030</th>
                                <th className="py-3 px-4 text-right font-bold">Saldo de Homologações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tableData.map((row, index) => (
                                <tr key={row.year} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                    <td className="py-3 px-4 font-bold text-white bg-[#0B1A4E]">{row.year}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2025)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2026)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2027)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2028)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2029)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(row.v2030)}</td>
                                    <td className="py-3 px-4 text-right font-bold text-white bg-[#0B1A4E]">{formatCurrency(row.saldo)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#0B1A4E] font-bold text-white">
                                <td className="py-4 px-4 uppercase">Total Previsto</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2025)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2026)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2027)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2028)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2029)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.v2030)}</td>
                                <td className="py-4 px-4 text-right">{formatCurrency(totals.saldo)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={() => setCurrentView('plurianual')}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                >
                    Plano Plurianual
                </button>
                <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-md transition-colors">
                    Serviços
                </button>
                <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-md transition-colors">
                    OBC
                </button>
            </div>
        </div>
    );
};

export default PlurianualDashboard;
