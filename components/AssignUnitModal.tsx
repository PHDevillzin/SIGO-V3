
import React, { useState, useMemo } from 'react';
import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from './Icons';
import { Unit } from '../types';

interface AssignUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (unit: Unit) => void;
    units: Unit[];
}

const AssignUnitModal: React.FC<AssignUnitModalProps> = ({ isOpen, onClose, onSave, units }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    const filteredUnits = useMemo(() => {
        if (!searchTerm) return units;
        const lower = searchTerm.toLowerCase();
        return units.filter(u => 
            u.unidade.toLowerCase().includes(lower) || 
            (u.codigoUnidade && u.codigoUnidade.toString().includes(lower))
        );
    }, [units, searchTerm]);

    const handleSave = () => {
        if (selectedUnit) {
            onSave(selectedUnit);
            setSelectedUnit(null);
            setSearchTerm('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Indicar Gestão Local (Unidade)</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar unidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="p-0 overflow-y-auto flex-grow">
                     {filteredUnits.length === 0 ? (
                         <div className="p-4 text-center text-gray-500">Nenhuma unidade encontrada.</div>
                     ) : (
                         <div className="divide-y divide-gray-100">
                             {filteredUnits.map(unit => (
                                 <div 
                                    key={unit.id} 
                                    onClick={() => setSelectedUnit(unit)}
                                    className={`p-3 cursor-pointer hover:bg-sky-50 transition-colors flex items-center justify-between ${selectedUnit?.id === unit.id ? 'bg-sky-100' : ''}`}
                                 >
                                     <div>
                                         <div className="font-medium text-gray-800">{unit.unidade}</div>
                                         <div className="text-xs text-gray-500">{unit.codigoUnidade} - {unit.entidade}</div>
                                     </div>
                                     {selectedUnit?.id === unit.id && <CheckIcon className="w-5 h-5 text-sky-600" />}
                                 </div>
                             ))}
                         </div>
                     )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedUnit}
                        className="px-4 py-2 bg-[#0EA5E9] text-white rounded-md hover:bg-sky-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignUnitModal;
