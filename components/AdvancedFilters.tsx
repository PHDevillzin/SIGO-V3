
import React, { useState, useEffect, useRef } from 'react';
import { ListIcon, CalendarDaysIcon, SparklesIcon, FilterIcon, MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from './Icons';

export interface AdvancedFiltersState {
    reclassified?: string;
    entidades?: string[];
    unidades?: string[];
    situacoes?: string[];
    origens?: string[];
    categorias?: string[];
    tipologias?: string[];
    tipos?: string[];
    tiposUnidade?: string[];
    de?: string;
    ate?: string;
}

interface AdvancedFiltersProps {
    hideSituacao?: boolean;
    hideTipologia?: boolean;
    showReclassified?: boolean;
    tipoOptions?: string[];
    tipoUnidadeOptions?: string[];
    activeFilters?: AdvancedFiltersState | null;
    onFilter?: (filters: AdvancedFiltersState) => void;
}

// Mock Options Data
const ENTIDADE_OPTIONS = ['SENAI', 'SESI'];
const UNIDADE_OPTIONS = [
    'CE 114 - Agudos', 'CAT Tatuapé', 'Sede', 'CE 055 - Osasco', 'CAT Campinas',
    'CE 201 - Itaquera', 'CAT Sertãozinho', '1.01 Brás', 'CE 342 - Jundiaí',
    'Nova Unidade', 'Escola SENAI', 'Oficina Central', 'CAT Santos'
];
const SITUACAO_OPTIONS = [
    'Em dia', 'Atenção', 'Atrasado', 'Cancelado', 'Concluído',
    'Em Execução', 'Não Iniciada', 'A Realizar', 'Em Andamento', 'Aguardando',
    'Em Licitação', 'Em Revisão', 'Em Aprovação', 'Planejamento'
];
const ORIGEM_OPTIONS = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 1 + i).toString()); // 2024 to 2034
const CATEGORIA_OPTIONS = [
    'Reforma Operacional', 'Baixa Complexidade', 'Nova Unidade',
    'Intervenção Estratégica', 'Reforma Estratégica', 'Manutenção'
];
const TIPOLOGIA_OPTIONS = ['Tipologia A', 'Tipologia B', 'Tipologia C', 'Tipologia D'];

export interface MultiSelectDropdownProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedValues, onChange, placeholder = "Selecione..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleOption = (option: string) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter(v => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    const handleRemoveTag = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(selectedValues.filter(v => v !== option));
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-left cursor-pointer focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 sm:text-sm flex justify-between items-center min-h-[38px]"
            >
                <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                    {selectedValues.length > 0 ? (
                        selectedValues.map(val => (
                            <span
                                key={val}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200"
                            >
                                {val}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemoveTag(e, val)}
                                    className="ml-1 flex-shrink-0 h-3 w-3 text-sky-400 hover:text-sky-600 focus:outline-none"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                    <div className="p-2 border-b border-gray-100 flex flex-col gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-sky-500"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {selectedValues.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-left text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-1 rounded transition-colors font-medium"
                            >
                                Limpar Seleção
                            </button>
                        )}
                    </div>
                    <ul className="max-h-60 overflow-auto py-1 text-sm text-gray-700">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li
                                    key={option}
                                    className="px-3 py-2 hover:bg-sky-50 cursor-pointer flex items-center"
                                    onClick={() => handleToggleOption(option)}
                                >
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mr-3"
                                        checked={selectedValues.includes(option)}
                                        readOnly
                                    />
                                    <span>{option}</span>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-gray-400 italic">Nenhuma opção encontrada</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ hideSituacao = false, hideTipologia = false, showReclassified = false, tipoOptions = [], tipoUnidadeOptions = [], activeFilters, onFilter }) => {

    // Initialize state arrays
    const [selectedEntidades, setSelectedEntidades] = useState<string[]>(activeFilters?.entidades || []);
    const [selectedUnidades, setSelectedUnidades] = useState<string[]>(activeFilters?.unidades || []);
    const [selectedSituacoes, setSelectedSituacoes] = useState<string[]>(activeFilters?.situacoes || []);
    const [selectedOrigens, setSelectedOrigens] = useState<string[]>(activeFilters?.origens || []);
    const [selectedCategorias, setSelectedCategorias] = useState<string[]>(activeFilters?.categorias || []);
    const [selectedTipologias, setSelectedTipologias] = useState<string[]>(activeFilters?.tipologias || []);
    const [selectedTipos, setSelectedTipos] = useState<string[]>(activeFilters?.tipos || []);
    const [selectedTiposUnidade, setSelectedTiposUnidade] = useState<string[]>(activeFilters?.tiposUnidade || []);

    const [deDate, setDeDate] = useState(activeFilters?.de || '');
    const [ateDate, setAteDate] = useState(activeFilters?.ate || '');

    const [reclassifiedYes, setReclassifiedYes] = useState(activeFilters?.reclassified === 'yes');
    const [reclassifiedNo, setReclassifiedNo] = useState(activeFilters?.reclassified === 'no');

    // Ensure state stays in sync if parent clears filters (activeFilters becomes null or empty)
    useEffect(() => {
        const filters = activeFilters || {};
        setSelectedEntidades(filters.entidades || []);
        setSelectedUnidades(filters.unidades || []);
        setSelectedSituacoes(filters.situacoes || []);
        setSelectedOrigens(filters.origens || []);
        setSelectedCategorias(filters.categorias || []);
        setSelectedTipologias(filters.tipologias || []);
        setSelectedTipos(filters.tipos || []);
        setSelectedTiposUnidade(filters.tiposUnidade || []);
        setDeDate(filters.de || '');
        setAteDate(filters.ate || '');
        setReclassifiedYes(filters.reclassified === 'yes');
        setReclassifiedNo(filters.reclassified === 'no');
    }, [activeFilters]);

    const handleFilter = () => {
        let reclassifiedStatus = 'all';
        if (showReclassified) {
            if (reclassifiedYes && !reclassifiedNo) {
                reclassifiedStatus = 'yes';
            } else if (!reclassifiedYes && reclassifiedNo) {
                reclassifiedStatus = 'no';
            }
        }

        if (onFilter) {
            onFilter({
                reclassified: reclassifiedStatus,
                entidades: selectedEntidades,
                unidades: selectedUnidades,
                situacoes: selectedSituacoes,
                origens: selectedOrigens,
                categorias: selectedCategorias,
                tipologias: selectedTipologias,
                tipos: selectedTipos,
                tiposUnidade: selectedTiposUnidade,
                de: deDate,
                ate: ateDate
            });
        }
    };

    const handleClear = () => {
        setSelectedEntidades([]);
        setSelectedUnidades([]);
        setSelectedSituacoes([]);
        setSelectedOrigens([]);
        setSelectedCategorias([]);
        setSelectedTipologias([]);
        setSelectedTipos([]);
        setSelectedTiposUnidade([]);
        setDeDate('');
        setAteDate('');
        setReclassifiedYes(false);
        setReclassifiedNo(false);

        if (onFilter) {
            onFilter({}); // Clear filters
        }
    };

    return (
        <div className="p-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
                <ListIcon className="w-6 h-6 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-800">Filtros avançados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <MultiSelectDropdown
                    label="Entidade"
                    options={ENTIDADE_OPTIONS}
                    selectedValues={selectedEntidades}
                    onChange={setSelectedEntidades}
                    placeholder="Filtre por Entidade"
                />

                <MultiSelectDropdown
                    label="Unidade"
                    options={UNIDADE_OPTIONS}
                    selectedValues={selectedUnidades}
                    onChange={setSelectedUnidades}
                    placeholder="Filtre por Unidade"
                />

                <MultiSelectDropdown
                    label="Tipo"
                    options={tipoOptions}
                    selectedValues={selectedTipos}
                    onChange={setSelectedTipos}
                    placeholder="Filtre por Tipo"
                />

                <MultiSelectDropdown
                    label="Tipo de Unidade"
                    options={tipoUnidadeOptions}
                    selectedValues={selectedTiposUnidade}
                    onChange={setSelectedTiposUnidade}
                    placeholder="Filtre por Tipo de Unidade"
                />

                {!hideSituacao && (
                    <MultiSelectDropdown
                        label="Situação"
                        options={SITUACAO_OPTIONS}
                        selectedValues={selectedSituacoes}
                        onChange={setSelectedSituacoes}
                        placeholder="Filtre por Status"
                    />
                )}

                <MultiSelectDropdown
                    label="Origem"
                    options={ORIGEM_OPTIONS}
                    selectedValues={selectedOrigens}
                    onChange={setSelectedOrigens}
                    placeholder="Selecione o ano"
                />

                {/* Row 2 */}
                <MultiSelectDropdown
                    label="Categoria Investimento"
                    options={CATEGORIA_OPTIONS}
                    selectedValues={selectedCategorias}
                    onChange={setSelectedCategorias}
                    placeholder="Filtre por Categoria"
                />

                <div className="relative">
                    <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-1">De:</label>
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
                    <label htmlFor="ate" className="block text-sm font-medium text-gray-700 mb-1">Até:</label>
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

                {!hideTipologia && (
                    <MultiSelectDropdown
                        label="Tipologia"
                        options={TIPOLOGIA_OPTIONS}
                        selectedValues={selectedTipologias}
                        onChange={setSelectedTipologias}
                        placeholder="Filtre por Tipologia"
                    />
                )}

                {showReclassified && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reclassificado</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    id="reclassificado-sim"
                                    type="checkbox"
                                    checked={reclassifiedYes}
                                    onChange={(e) => setReclassifiedYes(e.target.checked)}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <label htmlFor="reclassificado-sim" className="ml-2 block text-sm text-gray-900">
                                    Sim
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="reclassificado-nao"
                                    type="checkbox"
                                    checked={reclassifiedNo}
                                    onChange={(e) => setReclassifiedNo(e.target.checked)}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <label htmlFor="reclassificado-nao" className="ml-2 block text-sm text-gray-900">
                                    Não
                                </label>
                            </div>
                        </div>
                    </div>
                )}
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

export default AdvancedFilters;
