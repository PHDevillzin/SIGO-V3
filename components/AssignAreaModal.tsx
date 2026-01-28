
import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from './Icons';

interface AssignAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (area: string) => void;
}

const AssignAreaModal: React.FC<AssignAreaModalProps> = ({ isOpen, onClose, onSave }) => {
    const [selectedArea, setSelectedArea] = useState('');

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

    const handleSave = () => {
        if (selectedArea) {
            onSave(selectedArea);
            setSelectedArea('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Indicar Área Fim</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="mb-4 text-sm text-gray-600">Selecione a área responsável para validação desta demanda:</p>
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-6"
                    >
                        <option value="">Selecione uma área...</option>
                        {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedArea}
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
