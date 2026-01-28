
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from './Icons';
import type { Request, Manifestation } from '../types';

interface ManifestationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (manifestations: Manifestation[]) => void;
    request: Request | null;
    currentUser: string;
}

const ManifestationModal: React.FC<ManifestationModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    request, 
    currentUser 
}) => {
    const [manifestations, setManifestations] = useState<Manifestation[]>([]);
    
    // Initialize state when request changes
    useEffect(() => {
        if (request && request.manifestationTargets) {
            // Load existing OR create templates for targets
            const initialManifestations: Manifestation[] = request.manifestationTargets.map(targetArea => {
                // Find existing
                const existing = request.manifestations?.find(m => m.area === targetArea);
                if (existing) return existing;

                return {
                    area: targetArea,
                    text: '',
                    user: currentUser,
                    date: new Date().toISOString()
                };
            });
            setManifestations(initialManifestations);
        }
    }, [request, currentUser]);

    const handleTextChange = (area: string, text: string) => {
        setManifestations(prev => prev.map(m => 
            m.area === area ? { ...m, text, user: currentUser, date: new Date().toISOString() } : m
        ));
    };

    const handleSave = () => {
        // We save ALL manifestations back to the request
        onSave(manifestations);
    };

    if (!isOpen || !request) return null;

    const completedCount = manifestations.filter(m => m.text.trim().length > 0).length;
    const totalCount = manifestations.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Manifestação / Ciência</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-700">{request.description}</h4>
                    <p className="text-sm text-gray-500">{request.unit} - {request.entidade}</p>
                </div>

                <div className="p-4 overflow-y-auto flex-grow space-y-6">
                    {manifestations.map((manif, index) => (
                        <div key={manif.area} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">
                                    {manif.area}
                                </span>
                                {manif.text && (
                                    <span className="text-xs text-green-600 flex items-center">
                                        <CheckIcon className="w-3 h-3 mr-1" />
                                        Preenchido
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={manif.text}
                                onChange={(e) => handleTextChange(manif.area, e.target.value)}
                                maxLength={3000}
                                rows={4}
                                placeholder={`Insira a manifestação da área ${manif.area}...`}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>{manif.user} - {new Date(manif.date).toLocaleDateString()}</span>
                                <span>{manif.text.length}/3000</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {completedCount} de {totalCount} áreas manifestadas
                    </div>
                    <div className="flex space-x-3">
                         <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-[#0EA5E9] text-white rounded-md hover:bg-sky-600 font-medium flex items-center"
                        >
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Salvar Manifestação
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManifestationModal;
