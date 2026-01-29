
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
                        // "Aberto para a pessoa que pertença a área fim respectiva"
                        // Match area name with userProfile?
                        // Assuming tight coupling or checking if profile contains the area name.
                        const isAreaMatch = userProfile === manif.area || (userProfile && userProfile.includes(manif.area));
                        // Allow admin override or explicit match
                        const canEdit = isAreaMatch || (userProfile === 'Administrador do sistema');

                        return (
                            <div key={manif.area} className={`border rounded-lg p-4 ${canEdit ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded text-sm shadow-sm">
                                        {manif.area}
                                    </span>
                                    {manif.text && (
                                        <span className="text-xs text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                            <CheckIcon className="w-3 h-3 mr-1" />
                                            Preenchido por {manif.user}
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    value={manif.text}
                                    onChange={(e) => handleTextChange(manif.area, e.target.value)}
                                    maxLength={3000}
                                    rows={4}
                                    disabled={!canEdit}
                                    placeholder={canEdit ? `Insira a manifestação da área ${manif.area}...` : `Aguardando manifestação da área ${manif.area} (Somente usuários desta área podem editar)`}
                                    className={`w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                                />
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
