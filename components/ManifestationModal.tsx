
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from './Icons';
import type { Request, Manifestation } from '../types';

interface ManifestationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (manifestations: Manifestation[]) => void;
    request: Request | null;
    currentUser: string;
    userProfile?: string;
}

const ManifestationModal: React.FC<ManifestationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    request,
    currentUser,
    userProfile = ''
}) => {
    const [manifestations, setManifestations] = useState<Manifestation[]>([]);

    // Initialize state when request changes
    useEffect(() => {
        if (request) {
            let targets = request.manifestationTargets || [];

            // Fallback: If no targets defined (legacy or ad-hoc), infer from existing manifestations or current user
            if (targets.length === 0) {
                // Try areasEnvolvidas first (highest intent helper)
                if (request.areasEnvolvidas) {
                    targets = request.areasEnvolvidas.split(',').map(s => s.trim()).filter(Boolean);
                }

                if (targets.length === 0) {
                    const existingAreas = request.manifestations?.map(m => m.area) || [];
                    if (existingAreas.length > 0) {
                        targets = Array.from(new Set(existingAreas));
                    } else if (userProfile && userProfile !== 'Administrador do sistema' && !userProfile.includes('Administrador')) {
                        targets = [userProfile];
                    } else {
                        targets = ['Geral'];
                    }
                }
            }

            // Load existing OR create templates for targets
            const initialManifestations: Manifestation[] = targets.map(targetArea => {
                // Find existing
                const existing = request.manifestations?.find(m => m.area === targetArea);
                if (existing) return existing;

                return {
                    area: targetArea,
                    text: '',
                    user: '', // Empty initially if not filled
                    date: new Date().toISOString()
                };
            });
            setManifestations(initialManifestations);
        }
    }, [request, currentUser, userProfile]);

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
                    {manifestations.map((manif, index) => {
                        // Permission Check
                        const isAreaMatch = userProfile === manif.area || (userProfile && userProfile.includes(manif.area));
                        // Allow admin override or explicit match
                        const canEdit = isAreaMatch || (userProfile === 'Administrador do sistema');
                        const isFilled = !!manif.text && manif.text.trim().length > 0;
                        
                        // Check if current text differs from saved text (to enable Save button)
                        // saved text is in request.manifestations
                        const savedManif = request.manifestations?.find(m => m.area === manif.area);
                        const savedText = savedManif ? savedManif.text : '';
                        const hasChanges = manif.text !== savedText;

                        const isSenai = request.entidade === 'SENAI';

                        if (isSenai) {
                            return (
                                <div key={manif.area} className={`border rounded-lg p-4 flex justify-between items-center ${isFilled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">
                                            {manif.area}
                                        </span>
                                        {isFilled ? (
                                            <div className="text-sm text-green-700 font-medium flex items-center mt-1">
                                                <CheckIcon className="w-4 h-4 mr-1" />
                                                {manif.area} está ciente da demanda
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 mt-1">
                                                Aguardando ciência
                                            </div>
                                        )}
                                        {isFilled && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Registrado por {manif.user} em {new Date(manif.date).toLocaleDateString()} às {new Date(manif.date).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>

                                    {!isFilled && canEdit && (
                                        <button
                                            onClick={() => {
                                                // Create a single-item list or update the specific item in the FULL list from DB?
                                                // Strategy: Take current DB list, update this item, save.
                                                const currentDBList = request.manifestations || [];
                                                const newItem = { ...manif, text: 'Ciente', user: currentUser, date: new Date().toISOString() };
                                                
                                                // If item exists in DB, update it. If not, add it?
                                                // Actually we should map existing list + new.
                                                // But we want to IGNORE other local changes.
                                                // So we reconstruct the list from request.manifestations + this change.
                                                
                                                // Actually, onSave expects the FULL list to replace the 'manifestations' column.
                                                // So we must provide the full list.
                                                // We should use request.manifestations as base.
                                                
                                                let newList = [...(request.manifestations || [])];
                                                const existingIndex = newList.findIndex(m => m.area === manif.area);
                                                if (existingIndex >= 0) {
                                                    newList[existingIndex] = newItem;
                                                } else {
                                                    newList.push(newItem);
                                                }
                                                onSave(newList);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Ciente
                                        </button>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div key={manif.area} className={`border rounded-lg p-4 ${canEdit && !isFilled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded text-sm shadow-sm">
                                        {manif.area}
                                    </span>
                                    {manif.text && savedText === manif.text && savedText.length > 0 && (
                                        <span className="text-xs text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                            <CheckIcon className="w-3 h-3 mr-1" />
                                            Preenchido por {manif.user}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                <textarea
                                    value={manif.text}
                                    onChange={(e) => handleTextChange(manif.area, e.target.value)}
                                    maxLength={3000}
                                    rows={4}
                                    disabled={!canEdit}
                                    placeholder={
                                        savedText && savedText.length > 0
                                            ? `Manifestação registrada por ${manif.user}.`
                                            : canEdit
                                                ? `Insira a manifestação da área ${manif.area}...`
                                                : `Aguardando manifestação da área ${manif.area}`
                                    }
                                    className={`w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                                />
                                {canEdit && !isFilled && (
                                    <button
                                        onClick={() => {
                                            const newItem = { ...manif, user: currentUser, date: new Date().toISOString() };
                                            let newList = [...(request.manifestations || [])];
                                            const existingIndex = newList.findIndex(m => m.area === manif.area);
                                            // Handle case where it's not in DB yet (empty list)
                                            if (existingIndex >= 0) {
                                                newList[existingIndex] = newItem;
                                            } else {
                                                newList.push(newItem);
                                            }
                                            onSave(newList);
                                        }}
                                        disabled={!hasChanges || manif.text.length === 0}
                                        className={`self-end px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm transition-colors ${
                                            hasChanges && manif.text.length > 0 
                                            ? 'bg-[#0EA5E9] hover:bg-sky-600' 
                                            : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <CheckIcon className="w-5 h-5 block mx-auto" />
                                    </button>
                                )}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>{manif.user && manif.date ? `${manif.user} - ${new Date(manif.date).toLocaleDateString()}` : ''}</span>
                                    <span>{manif.text.length}/3000</span>
                                </div>
                            </div>
                        );
                    })}
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
                            Fechar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManifestationModal;
