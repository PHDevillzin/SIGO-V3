import React, { useState, useMemo } from 'react';
import { Unit } from '../types';
import {
    MagnifyingGlassIcon,
    FilterIcon,
    EyeIcon,
    PencilIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    TrashIcon
} from './Icons';
import UnitDetailsModal from './UnitDetailsModal';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';

export const initialUnits: Unit[] = [];

interface UnitsScreenProps {
    units: Unit[];
    setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
}

const UnitsScreen: React.FC<UnitsScreenProps> = ({ units, setUnits }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<AdvancedFiltersState | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, 3000);
    };

    const filteredUnits = useMemo(() => {
        let result = units;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.unidade.toLowerCase().includes(lower) ||
                u.cidade.toLowerCase().includes(lower) ||
                u.codigoUnidade.toLowerCase().includes(lower) ||
                u.centro.toLowerCase().includes(lower)
            );
        }

        if (activeFilters) {
            if (activeFilters.entidades && activeFilters.entidades.length > 0) {
                result = result.filter(u => activeFilters.entidades?.includes(u.entidade));
            }
            if (activeFilters.unidades && activeFilters.unidades.length > 0) {
                result = result.filter(u => activeFilters.unidades?.includes(u.unidade));
            }
        }

        return result;
    }, [units, searchTerm, activeFilters]);

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenModal = (unit: Unit | null, mode: 'view' | 'edit' | 'create') => {
        setSelectedUnit(unit);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleSaveUnit = async (unitData: any) => {
        try {
            if (modalMode === 'create') {
                const response = await fetch('/api/units', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(unitData)
                });

                if (response.ok) {
                    const newUnit = await response.json();
                    // Map snake_case response to camelCase if needed, OR ensure API returns camelCase
                    // Based on previous code, API returns DB columns which are snake_case?
                    // Let's check api/units.ts -- it does RETURNING *, so snake_case.
                    // But the Frontend uses camelCase. We'll need to map it in `fetchData` in App.tsx or here.
                    // Actually, App.tsx already does mapping. UnitsScreen expects camelCase.
                    // The API returns snake_case rows. 
                    // We should map the response here to match what App.tsx does.
                    const mappedUnit = {
                        ...newUnit,
                        codigoUnidade: newUnit.codigo_unidade,
                        responsavelRE: newUnit.responsavel_re,
                        responsavelRA: newUnit.responsavel_ra,
                        responsavelRAR: newUnit.responsavel_rar,
                        tipoDeUnidade: newUnit.tipo_de_unidade,
                        unidadeResumida: newUnit.unidade_resumida,
                        gerenteRegional: newUnit.gerente_regional,
                        emailGR: newUnit.email_gr
                    };

                    setUnits(prev => [mappedUnit, ...prev]);
                    showToast("Unidade cadastrada com sucesso!", "success");
                } else {
                    const err = await response.json();
                    showToast(`Erro ao cadastrar: ${err.error || 'Erro desconhecido'}`, "error");
                }
            } else {
                // Edit
                const response = await fetch('/api/units', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(unitData)
                });

                if (response.ok) {
                    const updated = await response.json();
                    const mappedUnit = {
                        ...updated,
                        codigoUnidade: updated.codigo_unidade,
                        responsavelRE: updated.responsavel_re,
                        responsavelRA: updated.responsavel_ra,
                        responsavelRAR: updated.responsavel_rar,
                        tipoDeUnidade: updated.tipo_de_unidade,
                        unidadeResumida: updated.unidade_resumida,
                        gerenteRegional: updated.gerente_regional,
                        emailGR: updated.email_gr
                    };
                    setUnits(prev => prev.map(u => u.id === unitData.id ? mappedUnit : u));
                    showToast("Dados atualizados com sucesso!", "success");
                } else {
                    const err = await response.json();
                    showToast(`Erro ao atualizar: ${err.error || 'Erro desconhecido'}`, "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Erro de conexão.", "error");
        }
        setIsModalOpen(false);
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            // Optimistic update
            const updatedUnits = units.map(u => u.id === id ? { ...u, status: !currentStatus } : u);
            setUnits(updatedUnits);

            const unitToUpdate = units.find(u => u.id === id);
            if (unitToUpdate) {
                const response = await fetch('/api/units', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...unitToUpdate, status: !currentStatus })
                });

                if (!response.ok) {
                    throw new Error('Failed to update status');
                }
                showToast(`Unidade ${!currentStatus ? 'ativada' : 'inativada'} com sucesso!`, 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro ao atualizar status.', 'error');
            // Revert on error
            setUnits(units);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;

        try {
            const response = await fetch(`/api/units?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setUnits(prev => prev.filter(u => u.id !== id));
                showToast('Unidade excluída com sucesso!', 'success');
            } else {
                showToast('Erro ao excluir unidade.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            <div
                className={`fixed top-6 left-6 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out flex items-center space-x-3 ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                role="alert"
            >
                {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <InformationCircleIcon className="w-5 h-5" />}
                <p className="font-semibold">{toast.message}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Unidades</h1>
                <button
                    onClick={() => handleOpenModal(null, 'create')}
                    className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors shadow-md"
                >
                    Cadastrar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative flex-grow max-w-lg w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Procurar por unidade, código, cidade ou centro..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-all shadow-sm ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                    >
                        <FilterIcon className="w-5 h-5" />
                        <span>Filtros Avançados</span>
                    </button>
                </div>

                {showAdvancedFilters && (
                    <AdvancedFilters
                        onFilter={(f) => {
                            setActiveFilters(f);
                            setCurrentPage(1);
                        }}
                        activeFilters={activeFilters}
                        hideSituacao
                        hideTipologia
                    />
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Código Unidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Entidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Tipo</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Centro</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">CAT</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Unidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Cidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RE</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">RA</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RA</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RAR</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Tipo de Unidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider text-center">Status</th>
                                <th className="px-4 py-4 text-center sticky right-0 bg-[#0B1A4E] font-bold tracking-wider z-10">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedUnits.map(unit => (
                                <tr key={unit.id} className="hover:bg-sky-50/30 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{unit.codigoUnidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.entidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipo}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.centro}</td>
                                    <td className="px-4 py-4 whitespace-nowrap truncate max-w-[200px]" title={unit.cat}>{unit.cat}</td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 truncate max-w-[250px]" title={unit.unidade}>{unit.unidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.cidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRE}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.ra}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRA}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRAR}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipoDeUnidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleToggleStatus(unit.id, unit.status)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${unit.status ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${unit.status ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-center sticky right-0 bg-white/95 border-l shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(unit, 'view')}
                                                className="p-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors shadow-sm focus:ring-2 focus:ring-sky-200"
                                                title="Visualizar Detalhes"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(unit, 'edit')}
                                                className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors shadow-sm focus:ring-2 focus:ring-purple-200"
                                                title="Editar Registro"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(unit.id)}
                                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm focus:ring-2 focus:ring-red-200"
                                                title="Excluir"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUnits.length === 0 && (
                                <tr>
                                    <td colSpan={13} className="px-4 py-16 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center">
                                            <SparklesIcon className="w-12 h-12 text-gray-200 mb-2" />
                                            <span>Nenhuma unidade encontrada para os filtros aplicados.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 text-gray-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <span className="min-w-[40px] h-10 flex items-center justify-center bg-sky-500 text-white font-bold rounded-md shadow-sm text-sm">
                                {currentPage}
                            </span>
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 text-gray-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                            Página {currentPage} de {totalPages || 1} ({filteredUnits.length} registros)
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Itens por página:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>

            <UnitDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                unit={selectedUnit}
                mode={modalMode}
                onSave={handleSaveUnit}
            />
        </div>
    );
};

export default UnitsScreen;
