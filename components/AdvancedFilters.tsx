import React from 'react';
import { ListIcon, CalendarDaysIcon, SparklesIcon, FilterIcon } from './Icons';

interface AdvancedFiltersProps {
    hideSituacao?: boolean;
    hideTipologia?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ hideSituacao = false, hideTipologia = false }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <div className="p-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
                <ListIcon className="w-6 h-6 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-800">Filtros avançados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <div>
                    <label htmlFor="entidade" className="block text-sm font-medium text-gray-700">Entidade</label>
                    <input type="text" id="entidade" placeholder="Filtre por Entidade" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="unidade" className="block text-sm font-medium text-gray-700">Unidade</label>
                    <input type="text" id="unidade" placeholder="Filtre por Unidade" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                {!hideSituacao && (
                    <div>
                        <label htmlFor="situacao" className="block text-sm font-medium text-gray-700">Situação</label>
                        <input type="text" id="situacao" placeholder="Filtre por Status" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                )}
                <div>
                    <label htmlFor="origem" className="block text-sm font-medium text-gray-700">Origem</label>
                    <select id="origem" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                        <option value="">Selecione o ano</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Row 2 */}
                <div>
                    <label htmlFor="categoriaInvestimento" className="block text-sm font-medium text-gray-700">Categoria Investimento</label>
                    <input type="text" id="categoriaInvestimento" placeholder="Filtre por Categoria Investimento" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div className="relative">
                    <label htmlFor="de" className="block text-sm font-medium text-gray-700">De:</label>
                    <input type="text" id="de" placeholder="dd/mm/aaaa" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <CalendarDaysIcon className="absolute right-3 top-8 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <label htmlFor="ate" className="block text-sm font-medium text-gray-700">Até:</label>
                    <input type="text" id="ate" placeholder="dd/mm/aaaa" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <CalendarDaysIcon className="absolute right-3 top-8 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {!hideTipologia && (
                    <div>
                        <label htmlFor="tipologia" className="block text-sm font-medium text-gray-700">Tipologia</label>
                        <input type="text" id="tipologia" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                )}
            </div>
            <div className="flex justify-end items-center mt-6 space-x-4">
                <button className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Limpar Filtros</span>
                </button>
                <button className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors">
                    <FilterIcon className="w-5 h-5" />
                    <span>Filtrar</span>
                </button>
            </div>
        </div>
    );
};

export default AdvancedFilters;