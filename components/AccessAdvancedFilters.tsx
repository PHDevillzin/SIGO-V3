import React, { useState, useEffect } from 'react';
import { ListIcon, CalendarDaysIcon, SparklesIcon, FilterIcon, XMarkIcon } from './Icons';
import { MultiSelectDropdown } from './AdvancedFilters';
import type { Unit, AccessProfile } from '../types';

export interface AccessAdvancedFiltersState {
    entidades?: string[];
    unidades?: string[];
    perfis?: string[];
    status?: string[];
    de?: string;
    ate?: string;
}

interface AccessAdvancedFiltersProps {
    units: Unit[];
    profiles: AccessProfile[];
    activeFilters?: AccessAdvancedFiltersState | null;
    onFilter?: (filters: AccessAdvancedFiltersState) => void;
}

const STATUS_OPTIONS = ['Ativo', 'Inativo'];
const ENTIDADE_OPTIONS = ['SESI', 'SENAI'];

const AccessAdvancedFilters: React.FC<AccessAdvancedFiltersProps> = ({ units, profiles, activeFilters, onFilter }) => {

    // Extract unique unit names for the dropdown
    const availableUnits = React.useMemo(() => {
        return Array.from(new Set(units.map(u => u.unidadeResumida || u.unidade))).sort();
    }, [units]);

    // Extract profile names
    const availableProfiles = React.useMemo(() => {
        return profiles.map(p => p.name).sort();
    }, [profiles]);

    const [selectedEntidades, setSelectedEntidades] = useState<string[]>(activeFilters?.entidades || []);
    const [selectedUnidades, setSelectedUnidades] = useState<string[]>(activeFilters?.unidades || []);
    const [selectedPerfis, setSelectedPerfis] = useState<string[]>(activeFilters?.perfis || []);
    const [selectedStatus, setSelectedStatus] = useState<string[]>(activeFilters?.status || []);

    const [deDate, setDeDate] = useState(activeFilters?.de || '');
    const [ateDate, setAteDate] = useState(activeFilters?.ate || '');

    useEffect(() => {
        const filters = activeFilters || {};
        setSelectedEntidades(filters.entidades || []);
        setSelectedUnidades(filters.unidades || []);
        setSelectedPerfis(filters.perfis || []);
        setSelectedStatus(filters.status || []);
        setDeDate(filters.de || '');
        setAteDate(filters.ate || '');
    }, [activeFilters]);

    const handleFilter = () => {
        if (onFilter) {
            onFilter({
                entidades: selectedEntidades,
                unidades: selectedUnidades,
                perfis: selectedPerfis,
                status: selectedStatus,
                de: deDate,
                ate: ateDate
            });
        }
    };

    const handleClear = () => {
        setSelectedEntidades([]);
        setSelectedUnidades([]);
        setSelectedPerfis([]);
        setSelectedStatus([]);
        setDeDate('');
        setAteDate('');

        if (onFilter) {
            onFilter({});
        }
    };

    return (
        <div className="p-6 border-t border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center space-x-2 mb-6">
                <ListIcon className="w-6 h-6 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-800">Filtros avançados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">

                <MultiSelectDropdown
                    label="Entidade"
                    options={ENTIDADE_OPTIONS}
                    selectedValues={selectedEntidades}
                    onChange={setSelectedEntidades}
                    placeholder="Filtre por Entidade"
                />

                <MultiSelectDropdown
                    label="Unidade"
                    options={availableUnits}
                    selectedValues={selectedUnidades}
                    onChange={setSelectedUnidades}
                    placeholder="Filtre por Unidade"
                />

                <MultiSelectDropdown
                    label="Perfil"
                    options={availableProfiles}
                    selectedValues={selectedPerfis}
                    onChange={setSelectedPerfis}
                    placeholder="Filtre por Perfil"
                />

                <MultiSelectDropdown
                    label="Status"
                    options={STATUS_OPTIONS}
                    selectedValues={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Filtre por Status"
                />

                <div className="relative">
                    <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-1">Cadastrado De:</label>
                    <input
                        type="text"
                        id="de"
                        value={deDate}
                        onChange={(e) => setDeDate(e.target.value)}
                        placeholder="dd/mm/aaaa"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => e.target.type = 'text'}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                    {deDate ? (
                        <button onClick={() => setDeDate('')} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <CalendarDaysIcon className="absolute right-3 top-8 w-5 h-5 text-gray-400 pointer-events-none" />
                    )}
                </div>
                <div className="relative">
                    <label htmlFor="ate" className="block text-sm font-medium text-gray-700 mb-1">Cadastrado Até:</label>
                    <input
                        type="text"
                        id="ate"
                        value={ateDate}
                        onChange={(e) => setAteDate(e.target.value)}
                        placeholder="dd/mm/aaaa"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => e.target.type = 'text'}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                    {ateDate ? (
                        <button onClick={() => setAteDate('')} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <CalendarDaysIcon className="absolute right-3 top-8 w-5 h-5 text-gray-400 pointer-events-none" />
                    )}
                </div>

            </div>
            <div className="flex justify-end items-center mt-6 space-x-4">
                <button
                    onClick={handleClear}
                    className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Limpar Filtros</span>
                </button>
                <button
                    onClick={handleFilter}
                    className="flex items-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors"
                >
                    <FilterIcon className="w-5 h-5" />
                    <span>Filtrar</span>
                </button>
            </div>
        </div>
    );
};

export default AccessAdvancedFilters;
