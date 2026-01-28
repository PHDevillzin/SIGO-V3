
import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from './Icons';

interface AssignAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (areas: string[]) => void;
}

const AssignAreaModal: React.FC<AssignAreaModalProps> = ({ isOpen, onClose, onSave }) => {
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    const areas = [
        'GSO',
        'TI',
        'RH',
        'Jurídico',
        'Financeiro',
        'Marketing',
        'Operações',
        'Outros'
    ];

    const toggleArea = (area: string) => {
        setSelectedAreas(prev => 
            prev.includes(area) 
                ? prev.filter(a => a !== area) 
                : [...prev, area]
        );
    };

    const handleSave = () => {
        if (selectedAreas.length > 0) {
            onSave(selectedAreas as any); // Type cast until we update parent prop type
            setSelectedAreas([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Indicar Áreas para Manifestação</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="mb-4 text-sm text-gray-600">Selecione as áreas responsáveis para manifestação desta demanda:</p>
                    <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                        {areas.map(area => (
                            <label key={area} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input
                                    type="checkbox"
                                    checked={selectedAreas.includes(area)}
                                    onChange={() => toggleArea(area)}
                                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                />
                                <span className="text-gray-700">{area}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedAreas.length === 0}
                            className="px-4 py-2 bg-[#0EA5E9] text-white rounded-md hover:bg-sky-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignAreaModal;
